//#import Util.js
//#import returnOrder.js
//#import afterSale.js
//#import order.js
//#import user.js
//#import file.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

/**
 * 获取退货单详情
 */
(function () {


    var res = CommonUtil.initRes();
    try {
        var loginUserId = LoginService.getFrontendUserId();
        if (!loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.E1M000003);
            return;
        }

        var aliasCode = $.params.aliasCode || "";
        if (!aliasCode) {
            CommonUtil.setErrCode(res, ErrorCode.E1M000000);
            return;
        }
        var jRefundOrder = AfterSaleService.getOrderByAliasCode(aliasCode);
        if (!jRefundOrder) {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00001);
            return;
        }

        if (jRefundOrder.buyerInfo.userId != loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00012);
            return;
        }
        var data = {};

        //获取订单状态
        var states = jRefundOrder.states;
        var returnDeliveryInfo = jRefundOrder.returnDeliveryInfo;
        var deliveryNo = returnDeliveryInfo.deliveryNo || "";  //退款运单号信息
        var type = {state: "", desc: ""}; // 1：有实物退款  2：无实物退款 3.已取消（审核未通过）
        var processState = {state: "0", desc: "待审核"}; //0：审核中 1：待退货  2：退货中 3.退款审核中  4 退款中  5 已退款
        var processTime = initProcessTime();
        processTime.formatCreateTime = $.getLongDate(Number(jRefundOrder.createTime));
        var refundOrderId = ""; //关联的退款单ID
        if (states) {
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
                //以下针对退货单的各种时间做处理
                if (approveState.state_1) {
                    processTime.ApprovedTime = $.getLongDate(Number(approveState.state_1.lastModifyTime));
                }
                if (approveState.state_3) {
                    processTime.ApprovedTime = $.getLongDate(Number(approveState.state_3.lastModifyTime));
                }
            }


        }

        var returnDeliveryInfo = jRefundOrder.returnDeliveryInfo;
        var deliveryNo = returnDeliveryInfo.deliveryNo || "";
        if(deliveryNo){
            processTime.getMailnoTime = $.getLongDate(Number(returnDeliveryInfo.lastModifyTime)) || "";
        }
        //商品信息
        var items = jRefundOrder.items;


        //退款金额
        var fMoney = "0.00", money = 0;
        var refTicketMoney = "0"; //券退款金额 单位：元
        var refIntegral = 0; //退积分数
        var refIntegralMoney = "0.00";  //退积分数折现金额 单位 元
        if (!isEmptyObject(jRefundOrder.refundInfo) && jRefundOrder.refundInfo instanceof Array) {

            for (var i = 0; i < jRefundOrder.refundInfo.length; i++) {
                var value = jRefundOrder.refundInfo[i];
                var refundInterfaceId = value.refundInterfaceId || value.refundWayId;
                if (refundInterfaceId) {

                    if (refundInterfaceId == "payi_2") { //购物券
                        refTicketMoney = (value.money) / 100 + "";
                    } else if (refundInterfaceId == "payi_4") { //支付积分 此处退货单跟退款单money字段表示的值不一样
                        var rateOfExchange = value.rateOfExchange;
                        if (!rateOfExchange) {
                            var jOrder = OrderService.getOrderByAliasCode(jRefundOrder.orderAliasCode);
                            if (jOrder.priceRateInfo) {
                                rateOfExchange = jOrder.priceRateInfo.RMB2INTEGRALRate;
                            }
                        }
                        if (!rateOfExchange) {
                            rateOfExchange = CartUtil.getRateOfRmb2IntegralExchange();
                        }

                        var tmpMoney = value.money;
                        refIntegralMoney = (tmpMoney / 100).toFixed(2);
                        refIntegral = Number(refIntegralMoney).div(rateOfExchange);
                    } else if (refundInterfaceId == "payi_11") { //赠送积分

                    } else {
                        money += Number(value.money);
                    }
                }
            }
            fMoney = (money / 100).toFixed(2);
        }


        //退款原因和责任
        var orderInfo = jRefundOrder.orderInfo;
        var duty = orderInfo.duty && orderInfo.duty.name || "";
        var reason = orderInfo.reason && orderInfo.reason.name || "";

        data.id = jRefundOrder.id;
        data.aliasCode = aliasCode;　//退货单号
        data.refundOrderId = refundOrderId; //关联的退款单号
        data.orderAliasCode = jRefundOrder.orderAliasCode; //外部订单号
        data.loginId = jRefundOrder.buyerInfo.loginId;  //用户ID
        data.userName = jRefundOrder.buyerInfo.realName;  //用户名
        data.createUserName = jRefundOrder.createUserName; //经手人
        data.createUserId = jRefundOrder.createUserId; //经手人ID
        data.remark = jRefundOrder.remark; //客服备注
        data.duty = duty;   //责任
        data.cusRemark = jRefundOrder.cusRemark; //原因详细描述
        data.fMoney = fMoney; //总退货金额
        data.refTicketMoney = 0.00; //券退款金额 单位:元
        data.refIntegralMoney = refIntegralMoney + ""; //退积分数折现金额 单位 元
        data.refIntegral = refIntegral; //退积分数
        data.items = getItemsInfo(items); //商品信息
        data.deliveryNo = deliveryNo; //商品信息
        data.type = type; //退款类型
        data.processState = processState;
        data.processTime = processTime;
        data.reason = reason;

        CommonUtil.setRetData(res, data);

    } catch (e) {
        $.log(e);
    }
})();

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

            if (dynaAttrs.attr_10000 && dynaAttrs.attr_10000.value && dynaAttrs.attr_10000.value[0]) {
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
            processState.desc = "退款审核中";
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

/**
 * 返回各种时间 - -!#
 * @returns {{}}
 */
function initProcessTime() {
    var ret = {};
    ret.formatCreateTime = ""; //申请时间
    ret.ApprovedTime = ""; //审核通过时间(退货单审核通过时间)
    ret.getMailnoTime = ""; //运单号录入时间
    ret.refundOrderCreateTime = ""; //退款单生成时间
    ret.refundTime = "";  //退款时间
    return ret;
};

