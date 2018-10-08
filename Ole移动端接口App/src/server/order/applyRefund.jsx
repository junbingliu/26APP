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
            ret.msg = "订单已取消，不能申请退款";
            out.print(JSON.stringify(ret));
            return;
        }
        //已支付
        if (jOrder.states.payState.state != "p201") {
            ret = ErrorCode.order.E1M01029;
            ret.msg = "订单未支付，不需要申请退款";
            out.print(JSON.stringify(ret));
            return;
        }
        //已签收，已出库不能取消
        if (jOrder.states.processState.state == "p112" || jOrder.states.processState.state == "p102") {
            ret = ErrorCode.order.E1M01030;
            ret.msg = "当前订单状态不能申请退款";
            out.print(JSON.stringify(ret));
            return;
        }
        var result = OpenOrderService.cancelOrder(jOrder.id, jOrder.aliasCode);
        if (result.code != "0") {
            ret = ErrorCode.order.E1M01028;
            ret.msg = "订单申请退款失败" + result.msg;
        }
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error(orderId + ",订单取消失败：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();