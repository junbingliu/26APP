//#import Util.js
//#import pigeon.js
//#import login.js
//#import user.js
//#import search.js
//#import sysArgument.js
//#import returnOrder.js
//#import afterSale.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 会员中心接口
 */
(function () {
    var loginUserId = LoginService.getFrontendUserId();

    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var jUser = UserService.getUser(loginUserId);
    if (!jUser) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    // var uCenterInfo = UserService.getUserCenterInfo(loginUserId);
    // $.log("...............uCenterInfo:"+JSON.stringify(uCenterInfo));
    var totalCount = 0;
    var totalNeedPay = 0;
    var stocking = 0;
    var delivering = 0;
    var searchArgs = {
        initialRecord: 1,
        fetchCount: 1,
        fromPath: 0,
        type: "ORDER"
    };
    var oleMerchantId = H5CommonUtil.getOleMerchantId();
    var args = [{n: 'buyerId', v: loginUserId, type: 'term', op: "and"},
        {n: 'sellerId', v: oleMerchantId, type: 'term', op: "and"},
        {n: 'orderType', v: "tryuse", type: 'term', op: "not"}];
    var queryArgs = {
        mode: 'adv',
        q: args
    };
    //搜索所有的订单
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    totalCount = result.searchResult.getTotal();

    queryArgs.q.push({n:'orderStateType2state_multiValued',v:'payState_p200',op:'and',type:'term'});
    queryArgs.q.push({n:'orderStateType2state_multiValued',v:'processState_p111',op:'not',type:'term'});

    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    totalNeedPay = result.searchResult.getTotal();
    queryArgs.q.pop();
    queryArgs.q.pop();
    queryArgs.q.push({n:'orderStateType2state_multiValued',v:'processState_p101',op:'and',type:'term'});

    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    stocking = result.searchResult.getTotal();

    queryArgs.q.pop();
    queryArgs.q.push({n:'orderStateType2state_multiValued',v:'processState_p102',op:'and',type:'term'});

    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result = SearchService.search(searchArgs);
    delivering = result.searchResult.getTotal();


    //查询售后退款订单数量
    var merchantId = H5CommonUtil.getOleMerchantId();
    var returnOrderList = ReturnOrderService.getUncancleAfterSaleOrderList(merchantId, loginUserId, "1", "50") + "";
    var refList = AfterSaleService.getAllRefundOrders(merchantId, loginUserId, "1", "50");
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

    var data = {
        userId: jUser.id,//会员id
        logo: jUser.logo,//头像
        nickname: jUser.nickname || jUser.loginId || jUser.mobilPhone,//昵称
        cardno: jUser.cardno,//会员卡号
        memberid: jUser.memberid,//会员id
        total: totalCount,//所有订单
        delivering: delivering,//待收货
        stocking: stocking,//待发货
        totalNeedPay: totalNeedPay,//待付款
        returnbackorder: backtotal//退换货
    };
    H5CommonUtil.setSuccessResult(data);
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