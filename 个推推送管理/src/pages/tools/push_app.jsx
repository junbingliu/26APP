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
    var result = GetuiExchangeUtil.postToGT(postData, "push_app", GetuiExchangeUtil.msgType.delivery);
    out.print(JSON.stringify(result));
    if (result.state == "ok") {
        var ret = result.returnData.result;
    }
})();