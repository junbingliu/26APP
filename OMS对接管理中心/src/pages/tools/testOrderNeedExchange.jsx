//#import Util.js
//#import order.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
(function () {
    var orderId = $.params["id"];
    if (!orderId) {
        out.print("订单ID:id不能为空!");
        return;
    }
    var jOrder = OrderService.getOrderByKey(orderId);
    if (!jOrder) {
        out.print("订单ID是" + orderId + "的订单不存在!");
        return;
    }
    var states = jOrder.states;
    var exchangeType = $.params["exchangeType"] || "add";
    var merchantId = jOrder.sellerInfo.merId;
    var beginTime = OmsControlArgService.getBeginTime("", merchantId);
    out.print("<br>........................needExchangeToOms " + merchantId + ":" + OmsControlArgService.needExchangeToOms(merchantId));
    out.print("<br>........................beginTime " + merchantId + ":" + beginTime);
    var createTime = jOrder.createTime;//订单创建时间
    var processState = states.processState;//订单处理状态 p100:未确认，p101:已确认，p102：已出库，p112：已签收，p111：已取消
    var payState = states.payState;//p200未支付,p201已支付

    //如果订单创建时间大于上线时间，证明是在上线之后创建的订单，那就要走新流程,所以不对接给ESB
    if (createTime >= beginTime) {
        out.print("<br>...........................createTime > beginTime exchange true");
        return true;
    }
    if (exchangeType == "cancel") {
        //如果是取消，那么未支付未确认的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
        if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
            out.print("<br> ...........................state error exchange false");
            return false;
        }
        out.print("<br> ...........................state ok exchange true");
        return true;
    } else if (exchangeType == "update") {
        //未确认未支付的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
        if (((payState.state == "p200" && processState.state == "p100") && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
            return false;
        }
        return true;
    } else if (exchangeType == "lock") {
        //未确认未支付的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
        if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
            return false;
        }
        return true;
    } else if (exchangeType == "release") {
        //未确认未支付的订单不需要对接OMS,还有已出库或者确认时间在接口上线时间之前的订单
        if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
            out.print("<br> ...........................state error exchange false");
            return false;
        }
        out.print("<br> ...........................state ok exchange true");
        return true;
    } else if (exchangeType == "add") {
        if ((payState.state == "p200" && processState.state == "p100") || processState.state == "p102" || (processState.p101 && processState.p101.lastModifyTime < beginTime)) {
            out.print("<br> ...........................state error exchange false");
            return false;
        }
        out.print("<br> ...........................state ok exchange true");
        return true;
    }
})();
