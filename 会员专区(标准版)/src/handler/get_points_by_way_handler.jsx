//#import Util.js
//#import login.js
//#import user.js
//#import address.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.org.apache.commons.lang,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.delivery,
        Packages.net.xinshi.isone.modules.deliveryPoint,
        Packages.net.xinshi.isone.base,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.org.apache.commons.lang,
        Packages.java.net,
        Packages.java.util.regex,
        Packages.net.xinshi.isone.security
    );

    var jResult = new selfApi.JSONObject();
    try {
        var regionId = request.getParameter("regionId");
        var merchantId = request.getParameter("merchantId");
        var deliveryWayId = request.getParameter("deliveryWayId");

        jResult.put("total", 0);
        jResult.put("records", new JSONArray());

        if (selfApi.StringUtils.isBlank(regionId)) {
            out.print(jResult.toString());
            return;
        }
        var deliveryWays = selfApi.IsoneModulesEngine.deliveryService.getDeliveryWay(deliveryWayId); //获取配送方式信息
        var supportDP = deliveryWays.optString("isSupportDP");
        var deliveryPointName;
        var deliveryPointList;
        if("1".equals(supportDP)){
            deliveryPointList = selfApi.DeliveryPointUtil.getDeliveryPointByRegionId(merchantId, regionId);
            if (deliveryPointList == null) {
                out.print(jResult.toString());
                return;
            }
            var jsonArray = new selfApi.JSONArray();
            var jTemp = null;
            for (var i=0;i<deliveryPointList.size();i++) {
                var jDeliveryPoint = deliveryPointList.get(i);
                jTemp = new selfApi.JSONObject();
                jTemp.put("id", jDeliveryPoint.optString("id"));
                jTemp.put("value", jDeliveryPoint.optString("id"));
                jTemp.put("name", jDeliveryPoint.optString("name"));

                jsonArray.put(jTemp);
            }
            jResult.put("total", deliveryPointList.size());
            jResult.put("records", jsonArray);
        }
        out.print(jResult.toString());
    } catch (ex) {
        $.log(ex)
        out.print(jResult.toString());
    }
})();