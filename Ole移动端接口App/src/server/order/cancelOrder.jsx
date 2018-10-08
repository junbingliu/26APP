//#import Util.js
//#import login.js
//#import order.js
//#import open-order.js
//#import @server/util/ErrorCode.jsx

(function () {
    var orderId = $.params.orderId;//订单外部号
    var ret = ErrorCode.S0A00000;

    try {
        if (!orderId) {
            ret = ErrorCode.order.E1M01027;
            out.print(JSON.stringify(ret));
            return;
        }
        var uid = LoginService.getFrontendUserId();
        if (!uid) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var jOrder = OrderService.getOrderByKey(orderId);
        if (!jOrder) {
            ret = ErrorCode.order.E1M01003;
            out.print(JSON.stringify(ret));
            return;
        }
        if (jOrder.buyerInfo.userId != uid) {
            ret = ErrorCode.order.E1M01004;
            out.print(JSON.stringify(ret));
            return;
        }
        //已取消
        if (jOrder.states.processState.state == "p111") {
            ret = ErrorCode.order.E1M01029;
            out.print(JSON.stringify(ret));
            return;
        }
        //已签收，已出库，已支付的订单未出库之前能取消
        if (jOrder.states.processState.state == "p112" || jOrder.states.processState.state == "p102") {
            ret = ErrorCode.order.E1M01030;
            out.print(JSON.stringify(ret));
            return;
        }
        var result = OpenOrderService.cancelOrder(jOrder.id, jOrder.aliasCode);
        if (result.code != "0") {
            ret = ErrorCode.order.E1M01028;
            ret.msg = result.msg;
        }
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error(orderId + ",订单取消失败：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();