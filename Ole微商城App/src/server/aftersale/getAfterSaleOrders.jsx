//#import Util.js
//#import login.js
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
    var start = 0;
    var page = $.params.page || 1;
    var limit = $.params.limit || 20;

    //todo：只是退货和退款单--begin-------------------------
    // var returnOrderList = ReturnOrderService.getUncancleAfterSaleOrderList(merchantId, loginUserId, "1", "200") + "";
    // var refList = AfterSaleService.getAllRefundOrders(merchantId, loginUserId, "1", "200");
    // var afterOrders = JSON.parse(returnOrderList);
    // var returnResult = afterOrders.recordList;  //退货单列表
    // var refResult = refList.recordList;  //退款单列表
    // var total = afterOrders.totalCount + refList.totalCount;  //结果总数
    //todo：只是退货和退款单--end-----------------------------

    //todo：这是退换货单。
    // var hasReturnOrderList = ReturnOrderService.getHasReturnOrderList(loginUserId, "-1", "1", "200") + "";
    var hasReturnOrderList = ReturnOrderService.getHasReturnOrderList(loginUserId, "-1", page + "", limit + "") + "";
    var OrderList = JSON.parse(hasReturnOrderList);
    var returnAndBarterResult = OrderList.recordList;  //退换货单列表
    var total = OrderList.totalCount;//退换货单总数
    var allBarterAndReturnList = [];
    allBarterAndReturnList = returnAndBarterResult.map(function (v, i) {
        var afterOrder = {};
        var id = "";
        if (v && v.id) {
            id = v.id;
            afterOrder = OrderService.getOrder(id);
        }
        if (v && v.orderTypeName) {
            afterOrder.orderTypeName = v.orderTypeName;
        }
        if (v && v.id == "o_common_130001_refund_90000") {
            // $.log("================跟踪o_common_130001_refund_90000换货单=组合后的afterOrder=================>" + JSON.stringify(afterOrder));
        }
        return afterOrder;
    })

    //todo：组合数据
    var unFinishCount = total;
    var ret = [];  //合并列表
    //

    // $.log("returnAndBartertotalCount======换货==========>"+OrderList.totalCount);
    // $.log("afterOrders.totalCount========退货========>"+afterOrders.totalCount);
    // $.log("afterOrders.totalCount========退款========>"+refList.totalCount);
    // $.log("====组合后的退换货单列表=====>\n"+JSON.stringify(allBarterAndReturnList));

    //
    //
    // var OleAfterSaleOrderList = ReturnOrderService.getOleAfterSaleOrderList(loginUserId, "-1", "1", "200") + "";
    // var OleAfterSaleOrders = JSON.parse(OleAfterSaleOrderList);
    //

    //todo：退换货单
    for (var i = 0; i < allBarterAndReturnList.length; i++) {
        var returnOrderInfo = getReturnInfo(allBarterAndReturnList[i]);
        if (returnOrderInfo.processState && returnOrderInfo.processState.state == "5") {
            unFinishCount--;
        }
        ret.push(returnOrderInfo);
    }

    //todo：只是退货单
    // for (var i = 0; i < returnResult.length; i++) {
    //     var returnOrderInfo = getReturnInfo(returnResult[i]);
    //     if (returnOrderInfo.processState && returnOrderInfo.processState.state == "5") {
    //         unFinishCount--;
    //     }
    //     ret.push(returnOrderInfo);
    // }

    //todo:退库单
    // for (var j = 0; j < refResult.length; j++) {
    //     if (refResult[j] && refResult[j].refundType == "return") {
    //         total--;
    //         unFinishCount--;
    //         continue;
    //     }
    //     var refOrderInfo = getRefundInfo(refResult[j]);
    //     if (refOrderInfo.processState && refOrderInfo.processState.state == "5") {
    //         unFinishCount--;
    //     }
    //     ret.push(refOrderInfo);
    // }

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
    // if (returnOrder.orderType != "barterProduct") {
    if (returnOrder.orderType == "barterProduct" || returnOrder.orderType == "returnProduct") {
        var orderAliasCode = returnOrder.orderAliasCode;
        var logisticsInfo = {};
        if (orderAliasCode) {
            var jOrder = OrderService.getOrderByAliasCode(orderAliasCode);
            //物流信息
            var tmpLogisticsInfo = jOrder.logisticsInfo;
            if (tmpLogisticsInfo) {
                if (tmpLogisticsInfo.billNo) {
                    logisticsInfo.billNo = tmpLogisticsInfo.billNo;//快递单号
                }
                var delMerchantColumnId = tmpLogisticsInfo.delMerchantColumnId;
                if (delMerchantColumnId) {
                    var delMerchantObj = OrderService.getOrder(delMerchantColumnId);
                    if (delMerchantObj.companyCode) {
                        logisticsInfo.companyCode = delMerchantObj.companyCode;
                    }
                }

            }
        }
        order.logisticsInfo = logisticsInfo;
        var states = returnOrder.states;
        var returnDeliveryInfo = returnOrder.returnDeliveryInfo;
        if (returnDeliveryInfo) {
            var inStore = returnDeliveryInfo.inStore;
            var deliveryType = {};
            if (inStore && inStore.deliveryType) {
                order.deliveryType = inStore.deliveryType;
            } else if (returnDeliveryInfo.deliveryType) {
                order.deliveryType = returnDeliveryInfo.deliveryType;
            }
        }

        var deliveryNo = returnDeliveryInfo.deliveryNo || "";
        var type = {state: "", desc: ""}; // 1：退货退款  2：仅退款 3.已取消（审核未通过）
        var processState = {state: "0", desc: "待审核"}; //0：审核中 1：待退货  2：退货中 3.退款中  4 退款审核中 5 已退款

        if (states) {
            var approveState = states.approveState || {};
            var warehousingState = states.warehousingState || {};
            var refundOrderState = states.refundOrderState;
            if (approveState) {
                var curState = approveState.state;
                if (returnOrder.orderType == "barterProduct") {//换货单
                    if (curState == "state_1") {
                        processState.state = "1";
                        processState.desc = "审核通过";
                    }
                } else {//退货单
                    if (curState == "state_1") {  //有实物退款，根据运单号判断是待退货还是退货中
                        type = {state: "1", desc: "退货退款"};
                        if (warehousingState.state == "Warehousing_N") {
                            if (!deliveryNo) {
                                processState.state = "1";
                                // processState.desc = "待退货";
                                processState.desc = "审核通过";
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
        }

        order.id = returnOrder.id;
        order.type = type;
        order.aliasCode = returnOrder.aliasCode;
        order.refundAliasCode = returnOrder.aliasCode;//退货单外部号
        order.orderAliasCode = returnOrder.orderAliasCode;
        if (returnOrder.orderType == "barterProduct") {//returnOrder 退货单 refundOrder 退款单
            order.asType = "barterOrder";
        } else if (returnOrder.orderType == "returnProduct") {
            order.asType = "returnOrder";
        }

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
        // $.log("refundApproveState=====>"+refundApproveState);
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
            item.amount = value.amount;//订单商品总数
            // item.imgUrl = "";
            item.logoUrl = "";
            var dynaAttrs = value.DynaAttrs;

            if (dynaAttrs && dynaAttrs.attr_10000 && dynaAttrs.attr_10000.value && dynaAttrs.attr_10000.value[0]) {
                var fileId = dynaAttrs.attr_10000.value[0].fileId;
                item.logoUrl = FileService.getFullPath(fileId);
            }
            item.signedAmount = value.signedAmount;  //总数量（已签收数量）
            item.exchangedAmount = value.exchangedAmount; //申请退货数量

            // var priceInfo = {};
            if (!isEmptyObject(value.priceInfo)) {
                // priceInfo.fUnitPrice = value.priceInfo.fUnitPrice; //商品单价
                item.fTotalPrice = value.priceInfo.fTotalPrice;  //订单中各商品的总价格
                item.unitPrice = value.priceInfo.fUnitPrice;  //订单中各商品的单价
            }
            // item.priceInfo = priceInfo;

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
        if (states && states.payState && states.payState.state && states.payState.state == "p201") {  //已支付的订单,退款单运费取订单运费
            var priceInfo = jOrder.priceInfo;
            deliveryPrice = priceInfo.fTotalDeliveryPrice + "";
        }

    }
    return deliveryPrice;
}