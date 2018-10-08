//#import Util.js
//#import returnOrder.js
//#import afterSale.js
//#import OrderUtil.js
//#import order.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

(function () {
    var res = CommonUtil.initRes();
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000003);
        return;
    }
    var merchantId = CartUtil.getOleMerchantId();
    var returnOrderList = ReturnOrderService.getUncancleAfterSaleOrderList(merchantId, loginUserId, "1", "200") + "";
    var refList = AfterSaleService.getAllRefundOrders(merchantId, loginUserId, "1", "200");
    var afterOrders = JSON.parse(returnOrderList);

    var returnResult = afterOrders.recordList;  //退货单列表
    var refResult = refList.recordList;  //退款单列表
    var total = afterOrders.totalCount + refList.totalCount;  //结果总数
    var unFinishCount = total;
    var ret = [];  //合并列表


    for (var i = 0; i < returnResult.length; i++) {
        var returnOrderInfo = getReturnInfo(returnResult[i]);
        if (returnOrderInfo.processState && returnOrderInfo.processState.state == "5") {
            unFinishCount--;
        }
        ret.push(returnOrderInfo);
    }

    for (var j = 0; j < refResult.length; j++) {
        if (refResult[j] && refResult[j].refundType == "return") {
            total--;
            unFinishCount--;
            continue;
        }
        var refOrderInfo = getRefundInfo(refResult[j]);
        if (refOrderInfo.processState && refOrderInfo.processState.state == "5") {
            unFinishCount--;
        }
        ret.push(refOrderInfo);
    }

    $.log("total==" + total);

    ret.sort(compare("createTime"));

    var data = {
        resultList: ret,
        total: total,
        unFinishCount: unFinishCount
    };
    CommonUtil.setRetData(res, data);

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

        order.id = returnOrder.id;
        order.type = type;
        order.aliasCode = returnOrder.aliasCode;
        order.orderAliasCode = returnOrder.orderAliasCode;
        order.asType = "returnOrder";  //returnOrder 退货单 refundOrder 退款单
        order.createTime = returnOrder.createTime;
        order.formatCreateTime = DateUtil.getLongDate(Number(returnOrder.createTime));
        order.processState = processState;
        order.deliveryPrice = getDeliveryPrice(returnOrder.orderAliasCode);

        //退款意向金额,因为包含运费,所以此处取 totalExpensePrice字段
        order.totalRefundPrice = returnOrder.totalExpensePrice ? (Number(returnOrder.totalExpensePrice) / 100).toFixed(2) : 0.00;
        //商品图片
        var items = returnOrder.items;
        order.items = getItemsInfo(items);

        var fMoney = "0.00", money = 0;
        if (!isEmptyObject(returnOrder.refundInfo) && returnOrder.refundInfo instanceof Array) {
            for (var i = 0; i < returnOrder.refundInfo.length; i++) {
                var value = returnOrder.refundInfo[i];
                if (value.refundInterfaceId == "payi_2" || value.refundInterfaceId == "payi_4" || value.refundInterfaceId == "payi_11") {

                } else {
                    money += Number(value.money);
                }
            }
            fMoney = (money / 100).toFixed(2);
        }
        order.fMoney = fMoney;
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
        var deliveryPrice = "0.00";
        if (refundOrder.refundType == "cancel") {
            var orderAliasCode = refundOrder.orderAliasCode;
            deliveryPrice = getDeliveryPrice(orderAliasCode);
        }

        order.id = refundOrder.id;
        order.type = {state: "2", desc: "仅退款"};
        order.aliasCode = "";
        order.orderAliasCode = refundOrder.orderAliasCode;
        order.asType = "refundOrder";  //returnOrder 退货单 refundOrder 退款单
        order.createTime = refundOrder.createTime;
        order.formatCreateTime = DateUtil.getLongDate(Number(refundOrder.createTime));
        order.processState = processState;
        order.deliveryPrice = deliveryPrice;

        //退款意向金额(包含运费)
        order.totalRefundPrice = refundOrder.totalExpensePrice ? (Number(refundOrder.totalExpensePrice) / 100).toFixed(2) : 0.00;

        //商品图片
        var items = refundOrder.items;
        order.items = getItemsInfo(items);

        var fMoney = 0.00;
        if (!isEmptyObject(refundOrder.refundInfo) && refundOrder.refundInfo instanceof Array) {
            fMoney = (Number(refundOrder.refundInfo[0].money) / 100).toFixed(2);
        }
        order.fMoney = fMoney;
    }
    return order;
}

/**
 * 按指定属性降序排列
 * @param prop
 * @returns {Function}
 */
function compare(prop) {
    return function (obj1, obj2) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
            val1 = Number(val1);
            val2 = Number(val2);
        }
        if (val1 < val2) {
            return 1;
        } else if (val1 > val2) {
            return -1;
        } else {
            return 0;
        }
    }
}


function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};

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
    // var deliveryPrice = refundeOrder.deliveryPrice + "";
    return processState;
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

            if (dynaAttrs && dynaAttrs.attr_10000 && dynaAttrs.attr_10000.value && dynaAttrs.attr_10000.value[0]) {
                var fileId = dynaAttrs.attr_10000.value[0].fileId;
                item.imgUrl = FileService.getFullPath(fileId);
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

function getDeliveryPrice(orderAliasCode) {
    var deliveryPrice = "0.00";
    var jOrder = OrderService.getOrderByAliasCode(orderAliasCode);

    if (jOrder) {
        var states = jOrder.states;
        if (states && states.payState && states.payState.state&&states.payState.state == "p201") {  //已支付的订单,退款单运费取订单运费
            var priceInfo = jOrder.priceInfo;
            deliveryPrice = priceInfo.fTotalDeliveryPrice + "";
        }

    }
    return deliveryPrice;
}