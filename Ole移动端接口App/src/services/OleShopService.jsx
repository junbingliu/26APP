//#import Util.js
//#import pigeon.js
//#import search.js
//#import user.js
//#import region.js
/**
 * 扫码购门店业务类
 */
var OleShopService = (function (pigeon) {
    var prefix = "ole_shop";//"trial_blackList";
    var listId = prefix + "_" + "list";
    var indexType = prefix + "_" + "index";
    var f = {};

    /**
     * 建立索引
     * @param id
     */
    var buildIndex = function (id) {
        if (!id) {
            return;
        }
        var obj = pigeon.getObject(id);
        var docs = [];

        if (obj) {
            var doc = {};
            doc.id = id;//黑名单序号
            doc.shopid = obj.shopid;//用户id
            doc.shopName = obj.shopName;//管理员id
            doc.shopAddress = obj.shopAddress;//活动id
            doc.regionId = obj.regionId;//商品id
            doc.shopPhone = obj.shopPhone;//订单id
            doc.lng = obj.lng;//原因码
            doc.lat = obj.lat;//加入原因
            doc.province = obj.province;
            doc.city = obj.city;
            doc.createTime = obj.createTime;//创建时间

            doc.ot = indexType;//

            docs.push(doc);
        }
        SearchService.index(docs, id);

    };
    /**
     * 获取搜索条件
     * @param param
     */
    var getQueryAttr = function (param) {

        var queryAttr = [{n: "ot", v: indexType, type: 'term'}];
        // $.log("\n\n 1 queryAttr = " + JSON.stringify(queryAttr) + "\n\n");




        if (param.id) {
            queryAttr.push({n: 'id', v: param.id, type: 'text', op: 'and'});
        }

        if (param.shopid) {
            queryAttr.push({n: 'shopid', v: param.shopid, type: 'text', op: 'and'});
        }

        if (param.shopName) {
            queryAttr.push({n: 'shopName', v: param.shopName, type: 'text', op: 'and'});
        }

        if (param.shopAddress) {
            queryAttr.push({n: 'shopAddress', v: param.shopAddress, type: 'text', op: 'and'});
        }

        if (param.regionId) {
            queryAttr.push({n: 'regionId', v: param.regionId, type: 'text', op: 'and'});
        }

        if (param.shopPhone) {
            queryAttr.push({n: 'shopPhone', v: param.shopPhone, type: 'text', op: 'and'});
        }

        if (param.lng) {
            queryAttr.push({n: 'lng', v: param.lng, type: 'text', op: 'and'});
        }

        if (param.lat) {
            queryAttr.push({n: 'lat', v: param.lat, type: 'text', op: 'and'});
        }



        if (param.beginTime && param.endTime) {
            var obj = {n: 'createTime', type: 'range', op: "and"};
            obj.high = param.endTime;
            obj.low = param.beginTime;
            queryAttr.push(obj);
        }
        return queryAttr;
    };

    /**
     * 通过一组id来获得一组json对象
     * @param ids
     * @returns {Array}
     */
    var getListByIds = function (ids) {
        if (ids && ids.length > 0) {
            return pigeon.getContents(ids).map(function (info) { //批量返回由字符串组成的列表
                return JSON.parse(info);
            })
        }
        return [];
    };

    /**
     * 新增门店信息
     * @param param：门店信息
     * @returns {string}
     */
    f.add = function (param) {
        var id = prefix + "_" + param.shopid;
        var obj = pigeon.getObject(id);
        if(obj){
            return "已存在该门店";
        }

        var shopInfo = {
            id: id,//黑名单序号
            shopid : param.shopid,
            shopName : param.shopName,
            shopAddress : param.shopAddress,
            regionId : param.regionId,
            province : param.province || "",
            city : param.city || "",
            shopPhone : param.shopPhone,
            lng : param.lng,
            lat : param.lat,
            createTime: new Date().getTime()//创建时间
        };

        $.log("\n\n shopInfoObj = " + JSON.stringify(shopInfo) + "\n\n");
        pigeon.saveObject(id, shopInfo);//保存对象

        var key = pigeon.getRevertComparableString(shopInfo.createTime, 13); // list的KEY

        pigeon.addToList(listId, key, shopInfo.id); // 保存对象到列表中

        buildIndex(shopInfo.id); // 添加索引
        return "SUCCESS";

    };
    /**
     * 添加索引, 用于查询
     * @param id 劵活动对象ID
     */
    f.update = function (id, param) {
        pigeon.saveObject(id, param);
        buildIndex(id);
        return true;
    };

    /**
     * 删除
     * @param id
     */
    f.delete = function(id) {
        var o = pigeon.getObject(id);
        if (o) {
            pigeon.saveObject(id, null);
            var key = pigeon.getRevertComparableString(o.createTime, 13);
            pigeon.deleteFromList(listId, key, id);
        }
        buildIndex(id)
    };

    f.getLoop = function(v, a, b){
        while( v > b){
                       v -= b - a
                     }
                 while(v < a){
                       v += b - a
                     }
                 return v;
    };
    f.getRange = function(v, a, b){
        if(a != null){
            v = Math.max(v, a);
        }
        if(b != null){
            v = Math.min(v, b);
        }
        return v;
    };
    /**
     * 将度转化为弧度
     * @param {degree} Number 度
     * @returns {Number} 弧度
     */
    f.degreeToRad =  function(degree){
        return Math.PI * degree/180;
    }
    f.getDistance = function (point1, point2){
        point1.lng = f.getLoop(point1.lng, -180, 180);
        point1.lat = f.getRange(point1.lat, -74, 74);
        point2.lng = f.getLoop(point2.lng, -180, 180);
        point2.lat = f.getRange(point2.lat, -74, 74);
        var x1, x2, y1, y2;
        x1 = f.degreeToRad(point1.lng);
        y1 = f.degreeToRad(point1.lat);
        x2 = f.degreeToRad(point2.lng);
        y2 = f.degreeToRad(point2.lat);
        var EARTHRADIUS = 6370996.81;
        var distance = EARTHRADIUS * Math.acos((Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)));
        if(distance){
            return Math.round(distance);
        }else {
            return null;
        }
    };
    f.getShowResult = function (result,lngParam,latParam) {
        var list = result.list;

        if (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                var regionId = list[i].regionId;
                $.log("\n\n regionId= " + regionId + "\n\n");
                $.log("\n\n RegionService.getRegionProvince(regionId)= " + RegionService.getRegionProvince(regionId) + "\n\n");
                $.log("\n\n RegionService.getRegionCity(regionId)= " + RegionService.getRegionCity(regionId) + "\n\n");
                list[i].provinceName = RegionService.getRegionProvince(regionId);
                list[i].cityName = RegionService.getRegionCity(regionId);
                var distance = null;
                if(lngParam && latParam){
                    $.log("\n\n 开始计算经纬度" + "\n\n");

                    var lng = list[i].lng;
                    var lat = list[i].lat;
                    if(lng && lat){
                        /**
                        var R = 6378137;
                        var dLat = (latParam - lat) * Math.PI / 180;
                        var dLng = (lngParam - lng) * Math.PI / 180;
                        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat * Math.PI / 180) * Math.cos(lngParam * Math.PI / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                        var distance = R * c;
                         **/
                        var point1 = {
                            lng : lng,
                            lat : lat
                        }
                        var point2 = {
                            lng : lngParam,
                            lat : latParam
                        }
                        distance = f.getDistance(point1,point2);
                        $.log("\n\n 开始计算经纬度 distance===" + distance+"\n\n");
                    }

                }
                list[i].distance = distance;
            }
        }
        result.list = list;
        return result;

    };
    f.getById = function(id){
        var data = pigeon.getObject(id);
        if(!data) {return null};
        return data;
    };
    f.getByShopId = function(shopId){
        var id = prefix + "_" + shopId;
        var data = pigeon.getObject(id);
        if(!data) {return {}};
        return data;
    };
    f.get = function (params, limit, start) {
        return f.getShowResult(f.getResultList(params, limit, start));
    };


    f.convertCoords = function(lng,lat){
        return selfApi.BaiduLocationUtil.getAddress(lng,lat);
    };
    f.getResultList = function (params, limit, start) {

        $.log("\n\n limit= " + limit + "\n\n");
        $.log("\n\n start= " + start + "\n\n");
        var queryAttr = getQueryAttr(params);
        $.log("\n\n queryAttr 5555= " + queryAttr + "\n\n");
        var searchArgs = {
            fetchCount: limit,
            fromPath: start - 1,
            sortFields: [
                {
                    field: "createTime",
                    type: "LONG",
                    reverse: true
                }],
            queryArgs: JSON.stringify({
                mode: "adv",
                q: queryAttr
            })
        };
        $.log("\n\n searchArgs = " + searchArgs + "\n\n");
        var result = SearchService.search(searchArgs);
        var allCount = result.searchResult.getTotal();  //所有通过关键词查询到的数量
        var idsJavaList = result.searchResult.getLists(); //实际获取的查询出的Id


        var ids = [];

        for (var i = 0, len = idsJavaList.size(); i < len; i++) {
            var id = idsJavaList.get(i) + "";
            if (id) {
                ids.push(id);
            }
        }
        var list = getListByIds(ids);

        var resultInfo = {
            "allCount": allCount,
            "NumOfPage": Math.ceil(allCount / limit),
            "list": list
        };
        return resultInfo;
    };

    return f;
})($S);