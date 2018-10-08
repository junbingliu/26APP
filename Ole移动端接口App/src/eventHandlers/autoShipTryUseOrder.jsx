//#import Util.js
//#import pigeon.js
//#import jobs.js

(function () {
    var order = ctx.get("order_object");
    var jOrder = JSON.parse(order.toString());

    if (jOrder.orderType != "tryuse" && jOrder.orderType != "scanbuy") {
        $.log(jOrder.id + ",当前订单不是试用订单和扫码购订单，不自动出库或签收");
        return;
    }
    /*if (!oleMid) {
        $.log(jOrder.id + ",获取Ole商家ID失败,未配置Ole商家ID");
        return;
    }
    if (merchantId != oleMid) {
        $.log(jOrder.id + ",当前订单所属商家不是Ole商家,不从顺丰下单");
        return;
    }*/
    var when = new Date().getTime() + 5 * 1000;//5s后执行
    var postData = {orderId: jOrder.id};
    if (jOrder.orderType == "tryuse") {
        JobsService.submitTask(appId, "jobs/AutoShipTryUseOrder.jsx", postData, when);
    } else {
        JobsService.submitTask(appId, "jobs/AutoSignScanOrder.jsx", postData, when);
    }
    //自动将试用订单出库
    //OpenOrderService.shippedOrderNoLogistics(jOrder.id, jOrder.aliasCode);
})();