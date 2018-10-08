//#import Util.js
//#import returnOrder.js
//#import afterSale.js

/**
 * 自动审核退货单，如果是退货入库类型的自动做退货入库
 */
(function () {
    if (typeof returnOrderId == "undefined") {
        return;
    }
    var returnOrder = AfterSaleService.getOrder(returnOrderId);
    if (!returnOrder) {
        $.log(returnOrderId + "，取不到对应的退货单");
        return;
    }
    if (returnOrder.states && returnOrder.states.approveState && returnOrder.states.approveState.state == "state_1") {
        $.log(returnOrderId + "，已审核，不需要再次审核");
        return;
    }
    if (!returnOrder.orderInfo) {
        returnOrder.orderInfo = {};
    }
    var newOrderInfo = {
        goodsType: "haveGoods",
        returnReasonType: {
            value: "reasonable",
            name: "有理由"
        },
        customServiceDuty: {
            value: "1",
            name: "商品"
        },
        customServiceReason: {
            value: "1",
            name: "商品质量问题"
        }
    };
    $.copy(returnOrder.orderInfo, newOrderInfo);
    var selfApi = new JavaImporter(
        Packages.org.json,
        Packages.net.xinshi.isone.modules.order.afterservice.tools.ReturnOrderUpdateRefundOrderStateUtil,
        Packages.net.xinshi.isone.modules
    );
    //修改退货原因等相关信息
    selfApi.IsoneOrderEngine.afterService.updateOrder(returnOrder.id, $.toJavaJSONObject(returnOrder));

    var ret = AfterSaleService.updateToCertifyPass(returnOrder.id, "u_sys", "系统");
    if (ret.code != "0") {
        $.log("..............." + returnOrderId + "，审核退货单失败:" + ret.msg);
        return;
    }
    if (returnOrder.states && returnOrder.states.warehousingState && returnOrder.states.warehousingState.state == "Warehousing_Y") {
        $.log(returnOrderId + "，已入库，不需要再次入库");
        return;
    }
    ret = AfterSaleService.updateToInStorage(returnOrder.id, "u_sys", "系统", "扫码购系统自动入库");
    if (ret.code != "0") {
        $.log("..............." + returnOrderId + "，自动入库失败:" + ret.msg);
        return;
    }
    if (returnOrder.states && returnOrder.states.refundOrderState && returnOrder.states.refundOrderState.state == "RefundOrderState_Y") {
        $.log(returnOrderId + "，已生成退款单，不需要再次生成退款单");
        return;
    }

    var javaRet = selfApi.ReturnOrderUpdateRefundOrderStateUtil.updateToRefundOrderState(returnOrder.id, "u_sys", "系统", "扫码购系统自动审核并生成退款单") + "";
    ret = JSON.parse(javaRet);
    if (ret.code != "0") {
        $.log("..............." + returnOrderId + "，自动生成退款单失败:" + ret.msg);
    }
})();