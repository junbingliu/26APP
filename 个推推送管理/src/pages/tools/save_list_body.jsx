//#import Util.js
//#import order.js
//#import md5Service.js
//#import $getui:services/GetuiArgService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx

(function () {
    var orderId = $.params["orderId"];
    if (!orderId) {
        out.print("请输入orderId");
        return;
    }

    //因为现在监听了订单增加后事件,所以在这里加多一些判断,防止无用的加入task
    var jOrder = OrderService.getOrderByKey(orderId.trim());
    if (!jOrder) {
        out.print("取不到订单：" + orderId);
        return;
    }
    var merchantId = jOrder.sellerInfo.merId;
    var jCheck = GetuiArgService.checkMerchantId(merchantId);
    if (jCheck.code != "0") {
        //只对接m_100的商家
        return;
    }
    var postData = GetuiExchangeUtil.getDeliveryPostData(jOrder);
    delete postData.notification;
    delete postData.condition;
    delete postData.requestid;
    var result = GetuiExchangeUtil.postToGT(postData, "save_list_body", GetuiExchangeUtil.msgType.delivery);
    out.print(JSON.stringify(result));
    if (result.state == "ok" && result.returnData.result == "ok") {
        var taskId = result.returnData.taskid;
        $.log(".....................taskId:"+taskId);
        var start = 0;
        var limit = 100;
        var clientIds = GetuiExchangeUtil.getUserClientIds(merchantId, "distributionType", start, limit);
        out.print("<br>clientId:" + JSON.stringify(clientIds));
        $.log("<br>clientId:" + JSON.stringify(clientIds));
        while (clientIds.length > 0) {
            postData = {
                cid: clientIds,
                taskid: taskId,
                need_detail: true
            };
            result = GetuiExchangeUtil.postToGT(postData, "push_list", GetuiExchangeUtil.msgType.delivery);
            out.print("push list result:"+JSON.stringify(result));
            start += limit;
            clientIds = GetuiExchangeUtil.getUserClientIds(merchantId, "distributionType", start, limit);
        }

    }
})();