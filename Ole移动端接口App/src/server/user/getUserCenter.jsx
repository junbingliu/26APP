//#import Util.js
//#import login.js
//#import user.js
//#import returnOrder.js
//#import afterSale.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js
//#import message.js
//#import @server/util/CartUtil.jsx

(function () {
    var ret = {
        code: 'E1B000006',
        msg: ""
    };
    try {
        var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        if (!buyerId) {
            buyerId = LoginService.getFrontendUserId();
        }
        //var buyerId = "u_50000";
        if (!buyerId) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
            return;
        } else {
            //获取购物车数量
            var num = CartUtil.getCountInCart("", "");
            //获取未读消息数量
            var mResult = MessageService.getInboxUnReadLetter(buyerId);
            var messageNum = mResult.totalCount;
            //查询售后退款订单数量
            var merchantId = CartUtil.getOleMerchantId();
            var returnOrderList = ReturnOrderService.getUncancleAfterSaleOrderList(merchantId, buyerId, "1", "50") + "";
            var refList = AfterSaleService.getAllRefundOrders(merchantId, buyerId, "1", "50");
            var afterOrders = JSON.parse(returnOrderList);
            var returnResult = afterOrders.recordList;  //退货单列表
            var refResult = refList.recordList;  //退款单列表
            var backtotal = afterOrders.totalCount + refList.totalCount;  //结果总数

            for (var i = 0; i < returnResult.length; i++) {
                var returnOrderInfo = getReturnInfo(returnResult[i]);
                if (returnOrderInfo.processState && returnOrderInfo.processState.state == "5") {
                    backtotal--;
                }
            }

            for (var j = 0; j < refResult.length; j++) {
                if (refResult[j] && refResult[j].refundType == "return") {
                    backtotal--;
                    continue;
                }
                var refOrderInfo = getRefundInfo(refResult[j]);
                if (refOrderInfo.processState && refOrderInfo.processState.state == "5") {
                    backtotal--;
                }
            }
            //查询用户中心信息
            var retuser = UserService.getUserCenterInfo(buyerId);
            var statestr = retuser.status;
            var retdata = retuser.data;
            if (statestr == "ok") {
                ret.code = "S0A00000";
                ret.msg = "获取个人中心信息成功";
                retdata.cartNum = num;
                retdata.messageNum = messageNum;
                retdata.returnbackorder = backtotal;
                ret.data = retdata;
                out.print(JSON.stringify(ret));
            } else {
                ret.code = "E1B000007";
                ret.msg = retuser.msg;
                out.print(JSON.stringify(ret));
                return;
            }
        }
    } catch (e) {
        ret.code = "E1B000008";
        ret.msg = "获取个人中心信息异常";
        out.print(JSON.stringify(ret));
    }

})();
/**
 * 获取退货单信息
 * @param returnOrder
 * @returns {{}}
 */
function getReturnInfo(returnOrder) {
    var order = {};
    // order.orderType = returnOrder.orderType;
    if (returnOrder.orderType != "barterProduct") {

        var states = returnOrder.states;
        var returnDeliveryInfo = returnOrder.returnDeliveryInfo;
        var deliveryNo = returnDeliveryInfo.deliveryNo || "";

        var type = {state: "", desc: ""}; // 1：退货退款  2：仅退款 3.已取消（审核未通过）
        var processState = {state: "0", desc: "待审核"}; //0：审核中 1：待退货  2：退货中 3.退款中  4 退款审核中 5 已退款

        if (states) {
            var approveState = states.approveState || {};
            var warehousingState = states.warehousingState || {};
            var refundOrderState = states.refundOrderState;
            if (approveState) {
                var curState = approveState.state;

                if (curState == "state_1") {  //有实物退款，根据运单号判断是待退货还是退货中
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
                            processState = getRefundState(returnOrder, "0");
                        }
                    }

                }
                if (curState == "state_3") {
                    type = {state: "2", desc: "仅退款"};
                    if (refundOrderState && refundOrderState.state == "RefundOrderState_Y") {
                        processState = getRefundState(returnOrder, "0");
                    }
                }

            }
        }
        order.processState = processState;
    }
    return order;
}
/**
 * 根据退款单获取相应信息
 * @param refundOrder
 */
function getRefundInfo(refundOrder) {
    var order = {};
    if (refundOrder) {
        var processState = getRefundState(refundOrder); // 3.退款中  4 退款审核中 5 已退款 6 已取消
        order.processState = processState;
    }
    return order;
}

/**
 * 判断当前退货退款的状态 type:0 根据退货单判断退款状态 其他值：根据退款单判断退款状态
 * @param refundOrder
 */
function getRefundState(returnOrder, type) {
    var processState = {};
    var refundeOrder = {};
    if (type == "0") {
        refundeOrder = AfterSaleService.getRefundOrderByReturnOrderId(returnOrder.orderId, returnOrder.id);
    } else {
        refundeOrder = returnOrder;
    }

    if (!refundeOrder) {
        return processState;
    }
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
            processState.desc = "退款审核中";
        }
        if (refundApproveState == "state_1") {
            if (refundState == "Refund_1") {
                processState.state = "5";
                processState.desc = "已退款";
            } else {
                processState.state = "4";
                processState.desc = "退款中"
            }

        }
        if (refundApproveState == "state_2") {
            processState.state = "6";
            processState.desc = "已取消";
        }
    }
    return processState;
}