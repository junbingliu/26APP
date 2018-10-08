//#import Util.js
//#import order.js
//#import payment.js
//#import realPayRec.js
//#import login.js
//#import $limitActivity:services/limitActivity.jsx

(function(){
    var jOrder = ctx.get("order_object"); //JSONObject
    var jStates = jOrder.opt("states");
    if(!jStates){
        return;
    }
    var jProcessState = jStates.opt("processState");
    if(!jProcessState){
        return;
    }
    var state = jProcessState.optString("state");
    if(state=='p111'){
        //已取消订单
        var jBuyerInfo = jOrder.optJSONObject("buyerInfo");
        var userId = "" + jBuyerInfo.optString("userId");
        LimitActivityService.rollBackActivities(userId,jOrder);
    }
})();
