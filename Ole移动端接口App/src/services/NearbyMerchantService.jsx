//#import Util.js
//#import pigeon.js
//#import open-util.js
var NearbyApi = new JavaImporter(
    Packages.net.xinshi.isone.modules.sysargument,
    Packages.net.xinshi.isone.modules,
    Packages.net.xinshi.pigeon.adapter,
    Packages.net.xinshi.isone.commons,
    Packages.org.json

);

var NearbyMerchantService = (function () {
    var fun ={};

    //返回一个JSONObject对象
    fun.newJSONObject = function (obj) {
        if(obj){
            return new NearbyApi.JSONObject(obj);
        }
        return new NearbyApi.JSONObject();
    }

    //返回一个JSONArray对象
    fun.newJSONarray = function () {
        return new NearbyApi.JSONArray();
    }

    //获取后台配置的配送范围
    fun.getDefaultDistance = function (m,c,key) {
        return NearbyApi.SysArgumentUtil.getSysArgumentStringValue(m, c,key);
    }


    fun.getIds = function (list) {
        return NearbyApi.Util.getIds(list);
    }

    fun.getGobalVariable = function (key) {
        //获取所有的全局变量
        var listName = "globalVariableList_all";
        //返回了一个ISortList

        var sortList = NearbyApi.StaticPigeonEngine.pigeon.getListFactory().getList(listName, false);
        if(sortList && sortList.getSize() > 0){
            var slo = sortList.getRange(0,-1);//返回了一个排序好的List
            var ids = NearbyApi.Util.getIds(slo);//返回了一个只有objid的list
            var objs = NearbyApi.StaticPigeonEngine.pigeon.getFlexObjectFactory().getContents(ids);
            for (var i = 0, len = objs.length; i < len; i++) {
                var obj = fun.newJSONObject(objs[i]);
                var name = obj.optString("name");
                if (key == name){
                    return obj.optString("val");
                }

            }

        }
        return "";
    }

    fun.getMerchantListByList = function (columnId) {
        return NearbyApi.IsoneModulesEngine.merchantService.getList(columnId);

    }

    fun.getMerchantListByIds = function (ids) {
        return NearbyApi.IsoneModulesEngine.merchantService.getListDataByIds(ids, false);
    }
    
    fun.getMerchantLocation = function (merchantId) {
        //locationArray是一个JSONArray
        var locationArray = NearbyApi.IsoneModulesEngine.baiduMapService.getLocation(merchantId);

        return locationArray;
    }

    return fun;
})();
