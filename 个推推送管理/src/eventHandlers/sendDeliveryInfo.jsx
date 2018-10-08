//#import Util.js
//#import md5Service.js
//#import jobs.js
//#import $getui:services/GetuiArgService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx

(function () {
    //因为现在监听了订单增加后事件,所以在这里加多一些判断,防止无用的加入task
    var order = ctx.get("order_object");

    if (!order) {
        return;
    }
    var jOrder = JSON.parse(order.toString());
    var merchantId = jOrder.sellerInfo.merId;
    var jCheck = GetuiArgService.checkMerchantId(merchantId);
    if (jCheck.code != "0") {
        //只对接配置的商家
        return;
    }
    /*var postData = GetuiExchangeUtil.getDeliveryPostData(jOrder);
    var result = GetuiExchangeUtil.postToGT(postData, "push_app", GetuiExchangeUtil.msgType.delivery);
    $.log(JSON.stringify(result));
    if (result.state == "ok") {
        var ret = result.returnData.result;
        $.log("...............result.returnData：" + JSON.stringify(result.returnData));
    }*/

    //在task里实现
    var when = (new Date()).getTime() + 5 * 60 * 1000;//5分钟后执行
    var postData = {};
    postData.orderId = jOrder.id;
    var taskId = JobsService.submitErpTask(appId, "task/send_delivery_msg.jsx", postData, when);
})();