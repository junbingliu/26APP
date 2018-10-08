//#import Util.js
//#import returnOrder.js
//#import afterSale.js
//#import order.js
//#import user.js
//#import DateUtil.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

/**
 * 返回退货单列表信息
 */
(function () {

    var res = CommonUtil.initRes();
    try {
        var loginUserId = LoginService.getFrontendUserId();
        if (!loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.E1M000003);
            return;
        }

        var merchantId = CartUtil.getOleMerchantId(),
            page = $.params.page || 1,
            limit = $.params.limit || 10;
        // var afterSaleOrderList = ReturnOrderService.getUncancleAfterSaleOrderList("m_50000", "u_50000") + "";
        var afterSaleOrderList = ReturnOrderService.getOleAfterSaleOrderList(merchantId, loginUserId, page, limit) + "";
        var result = JSON.parse(afterSaleOrderList);

        var records = result.recordList;

        var retrunOrderList = getRefundOrderListInfos(records);
        result.recordList = retrunOrderList;

        var data = result;
        CommonUtil.setRetData(res, data);


    } catch (e) {
        $.log(e);
    }

})();

/**
 * 获取退货单列表信息
 */
function getRefundOrderListInfos(refundeOrderList) {

    var ret = [];
    if (refundeOrderList instanceof Array) {
        for (var i = 0, len = refundeOrderList.length; i < len; i++) {
            var order = {}, tmpOrder = refundeOrderList[i];
            order.id = tmpOrder.id;
            order.orderType = tmpOrder.orderType;
            if (tmpOrder.orderType == "barterProduct") {
                continue;
            }

            var states = tmpOrder.states;
            var returnDeliveryInfo = tmpOrder.returnDeliveryInfo;
            var deliveryNo = returnDeliveryInfo.deliveryNo || "";

            var type = {state: "", desc: ""}; // 1：有实物退款  2：无实物退款 3.已取消（审核未通过）
            var processState = {state: "0", desc: "待审核"}; //0：审核中 1：待退货  2：退货中 3.退款中  4 退款审核中 5 已退款
            if (states) {
                var approveState = states.approveState || {};
                var warehousingState = states.warehousingState || {};
                var refundOrderState = states.refundOrderState;
                if (approveState) {
                    var curState = approveState.state;
                    if ("o_common_210001_refund_70000" == tmpOrder.id) {
                        $.log("curState==" + curState);
                    }
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
                                processState = getRefundState(tmpOrder);
                            }
                        }

                    }
                    if (curState == "state_3") {
                        type = {state: "2", desc: "仅退款"};
                        if (refundOrderState && refundOrderState.state == "RefundOrderState_Y") {
                            processState = getRefundState(tmpOrder);
                        }
                    }

                }
            }

            var orderInfo = tmpOrder.orderInfo;
            var reason = "", duty = "";
            if (orderInfo) {
                if (orderInfo.reason && orderInfo.reason.name) {
                    reason = orderInfo.reason.name;
                }
                if (orderInfo.duty && orderInfo.duty.name) {
                    duty = orderInfo.duty.name;
                }
            }

            order.type = type;
            order.aliasCode = tmpOrder.aliasCode;
            order.orderAliasCode = tmpOrder.orderAliasCode;
            order.merchantId = tmpOrder.merchantId;
            order.createUserId = tmpOrder.createUserId;
            order.createUserName = tmpOrder.createUserName;
            order.createTime = tmpOrder.createTime;
            order.formatCreateTime = DateUtil.getLongDate(Number(tmpOrder.createTime));
            order.processState = processState;
            order.reason = reason;
            order.duty = duty;
            //退款意向金额
            order.totalRefundPrice = tmpOrder.totalRefundPrice ? (Number(tmpOrder.totalRefundPrice) / 100).toFixed(2) : 0.00;

            //商品图片
            var items = tmpOrder.items;
            order.items = getItemsInfo(items);

            var fMoney = 0.00;
            if (!isEmptyObject(tmpOrder.refundInfo) && tmpOrder.refundInfo instanceof Array) {
                fMoney = (Number(tmpOrder.refundInfo[0].money) / 100).toFixed(2);
            }
            order.fMoney = fMoney;

            ret.push(order);
        }
    }

    return ret;
}

/**
 * 获取退款单商品行信息（图片，名称 价格等等）
 * @param items
 * @returns {Array}
 */
function getItemsInfo(items) {
    var ret = [];
    if (!isEmptyObject(items)) {
        for (var k in items) {
            var item = {};
            var value = items[k];
            item.cartItemId = k;
            item.realSkuId = value.realSkuId;
            item.productId = value.productId;
            item.name = value.name;
            item.imgUrl = "";
            var dynaAttrs = value.DynaAttrs;

            if (dynaAttrs.attr_10000.value && dynaAttrs.attr_10000.value[0]) {
                var fileId = dynaAttrs.attr_10000.value[0].fileId;
                (item.imgUrl = FileService.getFullPath(fileId));
            }
            item.signedAmount = value.signedAmount;  //总数量（已签收数量）
            item.exchangedAmount = value.exchangedAmount; //申请退货数量

            var priceInfo = {};
            if (!isEmptyObject(value.priceInfo)) {
                priceInfo.fUnitPrice = value.priceInfo.fUnitPrice; //商品单价
            }
            item.priceInfo = priceInfo;

            ret.push(item);
        }
    }
    return ret;
}

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};

/**
 * 判断退款单的状态
 * @param refundOrder
 */
function getRefundState(refundOrder) {
    var processState = {}
    var refundeOrder = AfterSaleService.getRefundOrderByReturnOrderId(refundOrder.orderId, refundOrder.id);
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
    }
    return processState;
}