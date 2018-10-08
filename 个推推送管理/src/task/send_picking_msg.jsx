//#import Util.js
//#import order.js
//#import md5Service.js
//#import $getui:services/GetuiArgService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx

(function () {
    if(typeof orderId == "undefined"){
        return;
    }
    var jOrder = OrderService.getOrder(orderId);
    if(!jOrder){
        return;
    }
    var merchantId = jOrder.sellerInfo.merId;
    var jCheck = GetuiArgService.checkMerchantId(merchantId);
    if (jCheck.code != "0") {
        //只对接配置的商家
        return;
    }
    var postData = GetuiExchangeUtil.getPickingPostData(jOrder);
    //通过push_app发送，根据tag来发
    /*var result = GetuiExchangeUtil.postToGT(postData, "push_app", GetuiExchangeUtil.msgType.picking);
    $.log(JSON.stringify(result));
    if (result.state == "ok") {
        var ret = result.returnData.result;
        $.log("...............result.returnData：" + JSON.stringify(result.returnData));
    }*/

    //通过push_list发送，先找出clientId再发送
    delete postData.notification;
    delete postData.condition;
    delete postData.requestid;
    postData.merchantId = merchantId;
    var result = GetuiExchangeUtil.postToGT(postData, "save_list_body", GetuiExchangeUtil.msgType.picking);
    if (result.state == "ok" && result.returnData.result == "ok") {
        var taskId = result.returnData.taskid;
        var start = 0;
        var limit = 100;
        var clientIds = GetuiExchangeUtil.getUserClientIds(merchantId, "pickingType", start, limit);
        while (clientIds.length > 0) {
            postData = {
                cid: clientIds,
                taskid: taskId,
                need_detail: true,
                merchantId: merchantId
            };
            result = GetuiExchangeUtil.postToGT(postData, "push_list", GetuiExchangeUtil.msgType.picking);
            start += limit;
            clientIds = GetuiExchangeUtil.getUserClientIds(merchantId, "pickingType", start, limit);
        }

    }
})();