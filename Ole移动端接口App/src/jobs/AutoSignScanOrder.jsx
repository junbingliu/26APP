//#import Util.js
//#import pigeon.js
//#import open-order.js
//#import order.js

(function () {
    if (typeof orderId == "undefined") {
        return;
    }
    var jOrder = OrderService.getOrder(orderId + "");
    var data = {};
    if (jOrder.orderType != "scanbuy") {
        $.log(jOrder.id + ",当前订单不是扫码购订单，不自动出库和签收");
        return;
    }
    //自动将扫码购订单出库
    var ret = OpenOrderService.shippedOrderNoLogistics(jOrder.id, jOrder.aliasCode);
    if (ret.code != "0") {
        $.log(jOrder.id + ",扫码购订单自动出库失败，不执行自动签收");
        return;
    }
    //自动将扫码购订单签收
    ret = OpenOrderService.signOrder(jOrder.id, jOrder.aliasCode);
    if (ret.code != "0") {
        $.log(jOrder.id + ",扫码购订单自动签收失败，失败原因：" + ret.msg);
    }
})();