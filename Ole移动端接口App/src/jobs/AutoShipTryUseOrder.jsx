//#import Util.js
//#import pigeon.js
//#import open-order.js
//#import order.js
//#import @server/util/CartUtil.jsx

(function () {
    if (typeof orderId == "undefined") {
        return;
    }
    var jOrder = OrderService.getOrder(orderId + "");
    var data = {};
    var merchantId = jOrder.merchantId;
    var oleMid = CartUtil.getOleMerchantId();
    if (jOrder.orderType != "tryuse") {
        $.log(jOrder.id + ",当前订单不是试用订单，不自动出库");
        return;
    }
    if (!oleMid) {
        $.log(jOrder.id + ",获取Ole商家ID失败,未配置Ole商家ID");
        return;
    }
    if (merchantId != oleMid) {
        $.log(jOrder.id + ",当前订单所属商家不是Ole商家,不从顺丰下单");
        return;
    }
    //自动将试用订单出库
    OpenOrderService.shippedOrderNoLogistics(jOrder.id, jOrder.aliasCode);
})();