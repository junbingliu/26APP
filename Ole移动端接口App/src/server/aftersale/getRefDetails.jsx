//#import Util.js
//#import returnOrder.js
//#import afterSale.js
//#import order.js
//#import user.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import @server/util/MathUtil.jsx

/**
 * 获取退款单详情
 */
(function () {

    var res = CommonUtil.initRes();

    var id = $.params.id || "";
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000003);
        return;
    }
    // try {
    if (!id) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000000);
        return;
    }
    var refOrder = AfterSaleService.getOrder(id);
    if (!refOrder) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00007);
        return;
    }

    if (refOrder.buyerInfo.userId != loginUserId) {
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00012);
        return;
    }

    var data = {};
    var reason = "";
    if (refOrder.reason) {
        reason = refOrder.reason.name ? refOrder.reason.name : "";
    }

    var type = getRefundType(refOrder); // 1：退货退款  2：仅退款
    var refState = getRefundState(refOrder);
    var processTime = initProcessTime();
    processTime.refundOrderCreateTime = $.getLongDate(Number(refOrder.createTime));
    var processState = refState.processState;  // 3.退款中  4 退款审核中 5 已退款 6 已取消
    $.override(processTime, refState.processTime);


    //商品信息
    var items = refOrder.items;

    //退款金额
    var fMoney = "0.00", money = 0;
    var refTicketMoney = "0"; //券退款金额 单位：元
    var refIntegral = 0; //退积分数
    var refIntegralMoney = 0.00;  //退积分数折现金额 单位 元
    if (!isEmptyObject(refOrder.refundInfo) && refOrder.refundInfo instanceof Array) {

        for (var i = 0; i < refOrder.refundInfo.length; i++) {
            var value = refOrder.refundInfo[i];
            var refundInterfaceId = value.refundInterfaceId || value.refundWayId;

            if (refundInterfaceId) {
                if (refundInterfaceId == "payi_2") { //购物券
                    refTicketMoney = (value.money / 100) + "";
                } else if (refundInterfaceId == "payi_4") { //支付积分
                    var rateOfExchange = value.rateOfExchange;
                    if (!rateOfExchange) {
                        var jOrder = OrderService.getOrderByAliasCode(refOrder.orderAliasCode);
                        if (jOrder.priceRateInfo) {
                            rateOfExchange = jOrder.priceRateInfo.RMB2INTEGRALRate;
                        }
                    }
                    if (!rateOfExchange) {
                        rateOfExchange = CartUtil.getRateOfRmb2IntegralExchange();
                    }

                    var tmpMoney = value.money;
                    refIntegralMoney = (tmpMoney / 100).toFixed(2);
                    var tmpRate = rateOfExchange * 100;
                    refIntegral = tmpMoney.div(tmpRate);
                } else if (refundInterfaceId == "payi_11") { //赠送积分

                } else {
                    money += value.money
                }
            }
        }
        fMoney = (money / 100).toFixed(2);
    }

    data.id = refOrder.id;
    data.orderAliasCode = refOrder.orderAliasCode;
    data.totalRefundPrice = refOrder.totalRefundPrice ? (Number(refOrder.totalRefundPrice) / 100).toFixed(2) : 0.00;
    data.reason = reason;
    data.type = type;
    data.processState = processState;
    data.processTime = processTime;
    data.items = getItemsInfo(items); //商品信息
    data.fMoney = fMoney; //总退货金额
    data.refTicketMoney = refTicketMoney; //券退款金额 单位:元
    data.refIntegralMoney = refIntegralMoney; //退积分数折现金额 单位 元
    data.refIntegral = refIntegral; //退积分数

    CommonUtil.setRetData(res, data);
    // } catch (e) {
    //     $.log(e + "");
    // }


})();


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


function getRefundState(refundOrder) {
    var processState = {};
    var processTime = initProcessTime();
    if (!refundOrder) {
        return {processState: processState, processTime: processTime};
    }
    if (refundOrder.states) {
        var refundApproveState = "";
        var refundState = "";
        var appState = refundOrder.states.approveState;
        if (appState) {
            refundApproveState = appState.state;
            if (appState.state_1) {
                processTime.approvedTime = $.getLongDate(Number(appState.state_1.lastModifyTime));
            }
        }
        if (refundOrder.states.refundState) {
            refundState = refundOrder.states.refundState.state;
        }
        if (refundApproveState == "state_0") {
            processState.state = "3";
            processState.desc = "退款审核中";
        }
        if (refundApproveState == "state_1") {
            if (refundState == "Refund_1") {
                processState.state = "5";
                processState.desc = "已退款";
                processTime.refundTime = $.getLongDate(Number(refundOrder.states.refundState.lastModifyTime));
            } else {
                processState.state = "4";
                processState.desc = "退款中";
                processTime.approvedTime = $.getLongDate(Number(refundOrder.states.approveState.lastModifyTime));
            }

        }
        if (refundApproveState == "state_2") {
            processState.state = "6";
            processState.desc = "已取消";
        }
    }
    return {processState: processState, processTime: processTime};
}

/**
 * 获取退款单关联的退货单类型：如果没有关联的退货单，则为仅退款
 * @param refundOrder
 */
function getRefundType(refundOrder) {
    var type = {state: "2", desc: "仅退款"}; //1：退货退款  2：仅退款 3.已取消（审核未通过）
    if (refundOrder) {
        var refundType = refundOrder.refundType; //change,return,cancel,reason
        if (refundType == "return") { //如果是退货退款订单，则获取到相关联的退款单 state_1 已同意退款
            var returnOrder = AfterSaleService.getOrder(refundOrder.returnOrderId);
            if (returnOrder.states && returnOrder.states.approveState) {
                var approveState = returnOrder.states.approveState.state;
                if (approveState == "state_1") {
                    type.state = "1";
                    type.desc = "退货退款";
                }
            }
        }
    }

    return type;
}

/**
 * 返回各种时间 - -!#
 * @returns {{}}
 */
function initProcessTime() {
    var ret = {};
    ret.approvedTime = ""; //审核通过时间(退款单审核通过时间)
    ret.refundOrderCreateTime = ""; //退款单生成时间
    ret.refundTime = "";  //退款时间
    return ret;
};