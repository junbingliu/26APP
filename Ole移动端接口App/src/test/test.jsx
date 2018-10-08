//#import Util.js
//#import order.js
//#import login.js
//#import user.js
//#import UserUtil.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

/**
 * 退货单申请
 * 接收参数：items:[{"cartItemId":cartItem_10040010,"refundAmount","2"},{"cartItemId":cartItem_10040011,"refundAmount","23"}]
 * cartItemId:"cartItem_10040010" , refundAmount:申请售后的数量
 */
(function () {

    var selfApi = new JavaImporter(
        net.xinshi.isone.modules.merchant.MerchantSysArgumentUtil,
        Packages.java.lang,
        Packages.java.math,
        Packages.net.xinshi.isone.modules.order,
        net.xinshi.isone.modules.price.PriceUtil,
        net.xinshi.isone.base.ext.ConcurrentHashMapExt,
        net.xinshi.isone.modules.order.afterservice,
        net.xinshi.isone.modules.order.afterservice.tools.ReturnOrderAddUtil,
        org.apache.commons.lang.StringUtils,
        Packages.org.json
    );


    /**
     * 获取退货商品相关信息
     * @param jOrder
     * @param refundItems
     * @returns {{}}
     */
    function getReturnProducts(jOrder, refundItems) {
        var result = {};
        if (!jOrder || !refundItems) {
            return result;
        }
        var priceinfo = jOrder.priceInfo;
        var jReturnItems = {};
        var fTotalOrderPayPrice = priceinfo.fTotalOrderPayPrice;  //原订单支付总价
        var totalProductRefundPrice = 0; //商品总退款金额
        //申请单--商品行信息
        var items = jOrder.items;
        for (var i = 0, len = refundItems.length; i < len; i++) {
            var refundItem = refundItems[i];
            var cartItemId = refundItems[i].cartItemId;
            var item = items[cartItemId];
            if (!item) {
                continue;
            }
            var isPresent = item.isPresent || "";
            if (isPresent != "1") { //非赠品
                var isVirtual = orderItem.isVirtual || "";
                var objType = orderItem.objType || "";
                if (isVirtual == "1" && objType == "套餐商品") {
                    continue;
                }

                var amount = orderItem.amount;
                var chooseAmount = orderItem.chooseAmount || amount;
                if (chooseAmount > 0) {
                    var refundAmount = refundItem.refundAmount;  //退货数量
                    var jNewItem = {};
                    var tempChooseAmount = chooseAmount - refundAmount;
                    var dUnitPrice = "";
                    var priceInfo = orderItem.priceInfo;
                    var bRefundPrice = ""; //售后金额
                    if (priceInfo) {
                        bRefundPrice = new selfApi.BigDecimal(priceInfo.fUnitPrice); //商品单价
                        dUnitPrice = priceInfo.unitPrice;
                    }
                    var bExchangedAmount = new selfApi.BigDecimal(refundAmount);
                    var tempRefundPrice = bRefundPrice.multiply(bExchangedAmount); //退货总金额
                    var bUnitPrice = new selfApi.BigDecimal(dUnitPrice);
                    var bAmount = new selfApi.BigDecimal(amount);
                    var bTotalPrice = bUnitPrice.multiply(bAmount); //商品行在订单的金额


                    var jItemPayRecs = orderItem.payRecs;
                    if (!isEmptyObject(jItemPayRecs)) {
                        var jTotalPriceD = selfApi.BigDecimal.ZERO;
                        for (var k in jItemPayRecs) {
                            // var itPayRecId = k;
                            jTotalPriceD = jTotalPriceD.add(new selfApi.BigDecimal(jItemPayRecs[k] || "0"));
                        }

                        bTotalPrice = selfApi.PriceUtil.multiply100(jTotalPriceD);
                        bUnitPrice = bTotalPrice.divide(bAmount);
                        bRefundPrice = new selfApi.BigDecimal(selfApi.String.valueOf(bUnitPrice));
                        tempRefundPrice = bRefundPrice.multiply(bExchangedAmount);
                    }

                    totalProductRefundPrice += tempRefundPrice.longValue();
                    jNewItem.exchangedAmount = refundAmount;
                    jNewItem.chooseAmount = tempChooseAmount;
                    jNewItem.refundPrice = bRefundPrice+"";
                    jNewItem.refundTotalPrice = selfApi.PriceUtil.divide100(tempRefundPrice)+"";
                    jNewItem.bTotalPrice = selfApi.PriceUtil.divide100(bTotalPrice)+"";

                    jReturnItems[cartItemId] = jNewItem;
                }
            } else {

            }

        }
        result.totalPrice = fTotalOrderPayPrice;
        result.totalProductRefundPrice = totalProductRefundPrice;
        result.returnProducts = jReturnItems;

        return result;
    }

    function getRefundInfo(jOrder, refundInfo, totalProductRefundPrice, totalOrderPayPrice) {
        var jRefunds = new selfApi.JSONArray();
        var afterOrderEventMaps = new selfApi.ConcurrentHashMapExt();
        afterOrderEventMaps.put("order_id", jOrder.optString("id"));
        afterOrderEventMaps.put("order_object", jOrder);
        afterOrderEventMaps.put("refundInfo", selfApi.StringUtils.isBlank(refundInfo) ? "" : refundInfo);
        afterOrderEventMaps.put("totalProductRefundPrice", totalProductRefundPrice + "");
        afterOrderEventMaps.put("totalOrderPayPrice", totalOrderPayPrice + "");
        selfApi.AfterSaleEventBusUtils.doFrontEndBeforeAddReturnOrderEvents(selfApi.AfterOrderEventName.frontEndBeforeAddReturnOrderEvent.name(), afterOrderEventMaps);
        jRefunds = afterOrderEventMaps.get("jRefunds");
        return jRefunds;
    };

    var res = CommonUtil.initRes();
    //try {
        var loginUserId = LoginService.getFrontendUserId();

        if (!loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.E1M000003);
            return;
        }
        var loginUser = UserService.getUser(loginUserId);
        if (!loginUser) {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00005);
            return;
        }
        var isAppMulMerchant = selfApi.MerchantSysArgumentUtil.isAppMulMerchant();
        var mallName = "商城责任";
        if (isAppMulMerchant) {
            mallName = "商家责任";
        }

        var orderAliasCode = "2017082811595648001";
        var opertType = "returnProduct";
        var selectReason = "re_50001";
        var cusRemark = "这是退货原因的详细描";  //问题详细描述
        var contactPerson = "艾永生";
        var mobilePhone = "13333333331";
        var refundInfo = "returnProduct"; //您期望的退款方式
        // var items = $.params.items;  //申请售后的商品行信息
        var items = [{"cartItemId":"cartItem_730004","refundAmount":"1"}];
        if (!contactPerson || !mobilePhone) {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00002);
            return;
        }


        var jOrder = OrderService.getOrderByAliasCode(orderAliasCode);
        if (!jOrder) {
            CommonUtil.setErrCode(res, ErrorCode.order.E1M01003);
            return;
        }
        var buyerInfo = jOrder.buyerInfo;
        if (!buyerInfo && !buyerInfo.userId) {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00003);
            return;
        }
        if (buyerInfo.userId != loginUserId) {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00004);
            return;
        }

        var jCalcReturnProduct = getReturnProducts(jOrder, items);
        var totalPrice = jCalcReturnProduct.totalPrice * 100;
        var totalProductRefundPrice = jCalcReturnProduct.totalProductRefundPrice;
        var returnProducts = jCalcReturnProduct.returnProducts;
        var fTotalProductRefundPrice = jCalcReturnProduct.totalPrice;
        var operatorInfo = {operatorId: loginUserId, operator: UserUtilService.getRealName(loginUser)};
        jOrder.operatorInfo = operatorInfo;

        //退款意向
        var jRefundInfo = getRefundInfo($.toJavaJSONObject(jOrder), "", totalProductRefundPrice, totalPrice)+"";
        var jDeliveryInfo = {},
            jDeliveryPayer = {},
            deliveryType = {};
        //todo 暂时只有客户寄回
        deliveryType.name = "客户寄回";
        deliveryType.value = 1;

        jDeliveryPayer.name = "商家";
        jDeliveryPayer.value = "0";

        jDeliveryInfo.deliveryType = deliveryType;
        jDeliveryInfo.deliveryPayer = jDeliveryPayer;
        jDeliveryInfo.userName = contactPerson;
        jDeliveryInfo.mobile = mobilePhone;

        var duty = {};
        if (!selectReason.equals("re_50001")) {
            duty.name = mallName;
            duty.value = 0;
        } else {
            duty.name = "客户责任";
            duty.value = 1;
        }

        var reason = selfApi.AfterOrderHelper.getResponsibilityDesc(selectReason);


        var jReturnOrderInfo = {};
        jReturnOrderInfo.orderId = jOrder.id;
        jReturnOrderInfo.afterSource = "order";
        jReturnOrderInfo.products = returnProducts;
        jReturnOrderInfo.deliveryInfo = jDeliveryInfo;
        jReturnOrderInfo.duty = duty;
        jReturnOrderInfo.reason = JSON.parse(reason +"");
        jReturnOrderInfo.refundInfo = JSON.parse(jRefundInfo+"");
        jReturnOrderInfo.remark = "";
        jReturnOrderInfo.cusRemark = cusRemark;
        jReturnOrderInfo.dDeliveryPrice = "0";
        jReturnOrderInfo.totalRefundPrice = fTotalProductRefundPrice;
        jReturnOrderInfo.totalExpensePrice = fTotalProductRefundPrice;

        var jConfig = {};
        jConfig.isNeedApprove = true;
        jConfig.isNeedCheckRefundInfo = true;
         out.print(JSON.stringify(jReturnOrderInfo));

        var jResult = selfApi.ReturnOrderAddUtil.addReturnOrder(loginUserId, $.toJavaJSONObject(jReturnOrderInfo), $.toJavaJSONObject(jConfig));
        $.log("jResult==="+jResult);

        var data = {};
        if (jResult && jResult.code && jResult.code == "0") {
            CommonUtil.setRetData(res, data);
        } else {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00006, jResult.msg);
        }

    //} catch (e) {
    //    $.log(e);
    //}
})();

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};