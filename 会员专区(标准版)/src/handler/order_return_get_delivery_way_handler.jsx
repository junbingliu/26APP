//#import Util.js
//#import login.js
//#import user.js
//#import address.js

;(function(){
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.delivery,
        Packages.net.xinshi.isone.base,
        Packages.net.xinshi.isone.commons,
        Packages.java.util,
        Packages.org.apache.commons.lang,
        Packages.java.net,
        Packages.java.util.regex,
        Packages.net.xinshi.isone.security
    );

    var ret = {
        state:false,
        errorCode:""
    }
    try{
        var contextPath = request.getContextPath();
        var loggedUser = LoginService.getFrontendUser();
        var userId = "";
        if(loggedUser != null){
            userId = loggedUser.id
        }else{
            ret.errorCode = "not_logged";
            out.print(JSON.stringify(ret));
            return;
        }

        var regionId = request.getParameter("regionId");
        var merchantId = request.getParameter("merchantId");
        var orderType = request.getParameter("orderType");

        var jResult = new selfApi.JSONObject();
        jResult.put("total", 0);
        jResult.put("records", new selfApi.JSONArray());


        var deliveryWayList = selfApi.DeliveryUtil.getValidDeliveryWayWithRegion(merchantId, regionId, orderType, false);
        if (deliveryWayList == null) {
            out.print(jResult.toString());
            return;
        }

        var jsonArray = new selfApi.JSONArray();
        var jTemp = null;

        for (var k=0;k<deliveryWayList.size();k++) {
            var jDeliveryWay = deliveryWayList.get(k);
            jTemp = new selfApi.JSONObject();
            jTemp.put("id", jDeliveryWay.optString("id"));
            jTemp.put("name", jDeliveryWay.optString("name"));
            jTemp.put("value", jDeliveryWay.optString("id"));
            jTemp.put("supportDP", jDeliveryWay.optString("isSupportDP"));//是否支持自提

            jsonArray.put(jTemp);
        }

        jResult.put("total", deliveryWayList.size());
        jResult.put("records", jsonArray);

        out.print(jResult.toString());
    }catch(e){
        ret.state = false;
        ret.errorCode = "system_error";
        out.print(JSON.stringify({"total":0,"records":[]}));
        $.log(e)
    }
})();