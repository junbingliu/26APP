//#import Util.js
//#import open-afterSale.js
//#import afterSale.js
//#import delMerchant.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

(function () {
    var res = CommonUtil.initRes();
    var returnOrderId = $.params.returnOrderId;
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000003);
        return;
    }
    if (!returnOrderId) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00008);
        return;
    }
    var jOrder = AfterSaleService.getOrderByAliasCode(returnOrderId);
    if (!jOrder) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00001);
        return;
    }
    var states = jOrder.states;
    if (states && states != "" && states != null) {
        getProcessState(states, jOrder);
    }
    var returnDeliveryInfo = jOrder.returnDeliveryInfo;
    if (returnDeliveryInfo && returnDeliveryInfo != "" && returnDeliveryInfo != null) {
        getCustomerDeliveryType(returnDeliveryInfo,jOrder);
    }
    CommonUtil.setRetData(res, jOrder);
    // out.print(JSON.stringify(jOrder));
    // return;
    // var data = {};
    // if (jResult && jResult.code && jResult.code == "0") {
    //     data = jOrder;
    //     CommonUtil.setRetData(res, data);
    // } else {
    //     CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00006, jResult.msg);
    // }
})();

/*
    todo：根据售后单数据，获取客户要求的售后取件方式
 */
function getCustomerDeliveryType(returnDeliveryInfo,jOrder) {
    if((!returnDeliveryInfo||returnDeliveryInfo==null||returnDeliveryInfo==undefined)||(!jOrder||jOrder==undefined||jOrder==null)){
        return false;
    }
    var inStore=returnDeliveryInfo.inStore;
    var deliveryType={};
    if(inStore&&inStore.deliveryType){
        jOrder.deliveryType=inStore.deliveryType;
    }else if(returnDeliveryInfo.deliveryType){
        jOrder.deliveryType=returnDeliveryInfo.deliveryType;
    }
}
/*
    todo：获取售后单的状态
 */
function getProcessState(states, jOrder) {
    if (!states||!jOrder) {
        return false;
    }
    var returnDeliveryInfo = jOrder.returnDeliveryInfo;
    var deliveryNo = returnDeliveryInfo.deliveryNo || "";  //退款运单号信息
    var type = {state: "", desc: ""}; // 1：有实物退款  2：无实物退款 3.已取消（审核未通过）
    var processState = {state: "0", desc: "待审核"}; //0：审核中 1：待退货  2：退货中 3.退款审核中  4 退款中  5 已退款
    var approveState = states.approveState || {};
    var warehousingState = states.warehousingState || {};
    var refundOrderState = states.refundOrderState;
    if (approveState) {
        var curState = approveState.state;
        if (curState == "state_1") {
            type = {state: "1", desc: "退货退款"};
            if (warehousingState.state == "Warehousing_N") {
                if (!deliveryNo) {
                    processState.state = "1";
                    processState.desc = "待退货";
                } else {
                    processState.state = "2";
                    processState.desc = "退货中";
                }
            }
            if (warehousingState.state == "Warehousing_Y") {
                if (refundOrderState && refundOrderState.state == "RefundOrderState_Y") {
                    var refState = getRefundState(jRefundOrder);
                    if (refState) {
                        refundOrderId = refState.refundOrderId;
                        processState = refState.processState;
                        $.override(processTime, refState.processTime);
                    }
                }
            }
        }
        if (curState == "state_3") {
            type = {state: "2", desc: "仅退款"};
            if (refundOrderState && refundOrderState.state == "RefundOrderState_Y") {
                var refState = getRefundState(jRefundOrder);
                if (refState) {
                    refundOrderId = refState.refundOrderId;
                    processState = refState.processState;
                    $.override(processTime, refState.processTime);
                }
            }
        }
    }
    jOrder.type=type;
    jOrder.processState=processState;
}


/**
 * 判断退款单的状态
 * @param refundOrder
 */
function getRefundState(refundOrder) {
    var processState = {};
    var processTime = initProcessTime();
    var refundeOrder = AfterSaleService.getRefundOrderByReturnOrderId(refundOrder.orderId, refundOrder.id);
    if (!refundeOrder) {
        return {processState: processState, processTime: processTime, refundOrderId: ""};
    }
    var refundOrderId = refundeOrder.id;
    processTime.refundOrderCreateTime = $.getLongDate(refundeOrder.createTime);  //退款单生成时间
    if (refundeOrder.states) {
        var refundApproveState = "";
        var refundState = "";
        if (refundeOrder.states.approveState) {
            refundApproveState = refundeOrder.states.approveState.state;
        }
        if (refundeOrder.states.refundState) {
            refundState = refundeOrder.states.refundState.state;
        }
        if (refundApproveState == "state_0") {
            processState.state = "3";
            processState.desc = "待审核";
        }
        if (refundApproveState == "state_1") {
            if (refundState == "Refund_1") {
                processState.state = "5";
                processState.desc = "已退款";
                processTime.refundTime = $.getLongDate(Number(refundeOrder.states.refundState.lastModifyTime));
            } else {
                processState.state = "4";
                processState.desc = "退款中";
                processTime.ApprovedTime = $.getLongDate(Number(refundeOrder.states.approveState.lastModifyTime));
            }

        }
    }
    return {processState: processState, processTime: processTime, refundOrderId: refundOrderId};
}