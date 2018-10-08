//#import Util.js
//#import $limitActivity:services/limitActivity.jsx

(function(){
    var jOrder = ctx.get("order_object");
    var jBuyerInfo = jOrder.optJSONObject("buyerInfo");
    var userId = "" + jBuyerInfo.optString("userId");
    try{
        LimitActivityService.checkAndLogActivities(userId,jOrder);
    }
    catch(e){
        ctx.put("state","error");
        ctx.put("msg",e);
        throw e;
    }
})();
