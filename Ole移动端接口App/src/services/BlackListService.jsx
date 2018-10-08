//#import Util.js
//#import pigeon.js
//#import search.js
//#import user.js
var BlackListService = (function (pigeon) {
    var prefix = "trial_blackList";
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
            doc.userId = obj.userInfo.userId;//用户id
            doc.managerId = obj.managerId;//管理员id
            doc.activityId = obj.activityId;//活动id
            doc.productId = obj.productId;//商品id
            doc.orderId = obj.orderId;//订单id
            doc.reasonCode = obj.reasonCode;//原因码
            doc.inReason = obj.inReason;//加入原因
            doc.outReason = obj.outReason;//移除原因
            doc.createTime = obj.createTime;//创建时间

            doc.keyword_text = obj.activityId;//关键字活动id
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

        if (param.keyword) {
            queryAttr.push({n: 'keyword_text', v: param.keyword, type: 'text', op: 'and'});
        }


        if (param.id) {
            queryAttr.push({n: 'id', v: param.id, type: 'text', op: 'and'});
        }

        if (param.userId) {
            queryAttr.push({n: 'userId', v: param.userId, type: 'text', op: 'and'});
        }

        if (param.managerId) {
            queryAttr.push({n: 'managerId', v: param.managerId, type: 'text', op: 'and'});
        }

        if (param.productId) {
            queryAttr.push({n: 'productId', v: param.productId, type: 'text', op: 'and'});
        }

        if (param.activityId) {
            queryAttr.push({n: 'activityId', v: param.activityId, type: 'text', op: 'and'});
        }

        if (param.orderId) {
            queryAttr.push({n: 'orderId', v: param.orderId, type: 'text', op: 'and'});
        }

        if (param.reasonCode) {
            queryAttr.push({n: 'reasonCode', v: param.reasonCode, type: 'text', op: 'and'});
        }

        if (param.inReason) {
            queryAttr.push({n: 'inReason', v: param.inReason, type: 'text', op: 'and'});
        }

        if (param.outReason) {
            queryAttr.push({n: 'outReason', v: param.outReason, type: 'text', op: 'and'});
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
     * 将用户加入黑名单
     * @param userId：用户id
     * @param inReason：加入黑名单原因
     * @returns {string}
     */
        f.add = function (userId, managerId, activityId, productId,orderId, inReason) {
        var id = prefix + "_" + pigeon.getId(prefix);
        var blackListObj = {
            id: id,//黑名单序号
            userInfo: {
                userId: userId//用户Id
            },
            managerId: managerId,//管理员id
            activityId: activityId,//活动id
            productId: productId,//商品id
            orderId:orderId,//订单id
            reasonCode: inReason.code,//原因码
            inReason: inReason.reason,//加入原因
            outReason: "",//移除原因
            createTime: new Date().getTime()//创建时间
        };

        $.log("\n\n blackListObj = " + JSON.stringify(blackListObj) + "\n\n");
        pigeon.saveObject(id, blackListObj);//保存对象

        var key = pigeon.getRevertComparableString(blackListObj.createTime, 13); // list的KEY

        pigeon.addToList(listId, key, blackListObj.id); // 保存对象到列表中

        buildIndex(blackListObj.id); // 添加索引
        return blackListObj.id;

    };
    //TODO
    f.delete = function (userId, managerId, outReason) {
        // var params = {
        //     userId: userId
        // };
        //
        // var blackListObj = f.get(params, 10, 0).list[0];
        //
        // blackListObj.managerId = managerId;
        // blackListObj.inReason = "";
        // blackListObj.outReason = outReason;
        return "这是一个空的方法";

    };

    f.getShowResult = function (result) {
        var list = result.list;

        if (list) {
            for (var i = 0, len = list.length; i < len; i++) {
                var userInfo = UserService.getUser(list[i].userInfo.userId);
                list[i].userInfo.realName = userInfo.realName || "";
                list[i].userInfo.nickName = userInfo.nickName || "";
                list[i].userInfo.mobilPhone = userInfo.mobilPhone || "";
                var source = userInfo.source || "";
                var sourceCn = "";
                switch (source) {
                    case "100":
                        sourceCn = "线下:后台导入";
                        break;
                    case "wexin":
                        sourceCn = "线上:微信";
                        break;
                    case "sina":
                        sourceCn = "线上:手机客户端";
                        break;
                    case "qq":
                        sourceCn = "线上:腾讯QQ";
                        break;
                    default:
                        sourceCn = "线上:网上商城";
                }

                list[i].userInfo.source = sourceCn;

            }
        }
        result.list = list;
        return result;

    };
    f.get = function (params, limit, start) {
        return f.getShowResult(f.getResultList(params, limit, start));
    };

    f.getStatusByOrderId = function (orderId) {
        var flag = true;

        var result = f.getResultList({orderId: orderId}, 1, 0);

        if (result.allCount == 0) {
            flag = false;
        }

        return  flag;
    };

    f.getResultList = function (params, limit, start) {
        var queryAttr = getQueryAttr(params);

        var searchArgs = {
            fetchCount: limit,
            fromPath: start,
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

        var result = SearchService.search(searchArgs);
        var allCount = result.searchResult.getTotal();  //所有通过关键词查询到的数量
        var idsJavaList = result.searchResult.getLists(); //实际获取的查询出的Id

        $.log("\n\n allCount = " + allCount + "\n\n");
        $.log("\n\n idsJavaList = " + idsJavaList.size() + "\n\n");
        $.log("\n\n saved list size = " + JSON.stringify(pigeon.getList(listId, 0, -1).length) + "\n\n");

        var ids = [];

        for (var i = 0, len = idsJavaList.size(); i < len; i++) {
            var id = idsJavaList.get(i) + "";
            if (id) {
                ids.push(id);
            }
        }

        return {
            "allCount": allCount,
            "NumOfPage": Math.ceil(allCount / limit),
            "list": getListByIds(ids)
        }
    };
    return f;
})($S);