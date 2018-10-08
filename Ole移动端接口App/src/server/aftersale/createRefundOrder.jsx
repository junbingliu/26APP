//#import Util.js
//#import order.js
//#import login.js
//#import user.js
//#import UserUtil.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import @server/util/MathUtil.jsx

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
     *
     */
    function getReturnProducts(jOrder, refundItems) {
        var result = {};
        if (!jOrder || !refundItems) {
            return result;
        }
        var priceInfo = jOrder.priceInfo;
        var jReturnItems = {};
        var totalProductRefundPrice = 0; //商品总退款金额
        var orderType = jOrder.orderType;  //预售订单跟普通订单退货规则不同，这里取订单类型
        //申请单--商品行信息
        var items = jOrder.items;
        for (var i = 0, len = refundItems.length; i < len; i++) {
            var refundItem = refundItems[i];
            var cartItemId = refundItems[i].cartItemId;
            var orderItem = items[cartItemId];
            var productName = orderItem.name;
            if (!orderItem) {
                continue;
            }
            var isPresent = orderItem.isPresent || "";
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
                    if (refundAmount > chooseAmount) {
                        var msg = "商品名称为【" + productName + "】的商品退货数量【" + refundAmount + "】超出了最大可退货数量";
                        return {result: "-1", msg: msg};
                    }
                    var jNewItem = {};
                    var tempChooseAmount = chooseAmount - refundAmount;
                    var dUnitPrice = "";  //商品单价 单位分
                    var itemPriceInfo = orderItem.priceInfo;
                    var bRefundPrice = ""; //一个商品行商品售后金额 单位：元
                    if (itemPriceInfo) {
                        bRefundPrice = itemPriceInfo.fUnitPrice; //商品单价 单位：元
                        dUnitPrice = itemPriceInfo.unitPrice;    //商品单价 单位：分
                    }
                    var tempRefundPrice = dUnitPrice * refundAmount; //退货总金额
                    var bTotalPrice = dUnitPrice * refundAmount; //商品行在订单的金额


                    totalProductRefundPrice += tempRefundPrice;
                    jNewItem.exchangedAmount = refundAmount;
                    jNewItem.chooseAmount = tempChooseAmount;
                    jNewItem.refundPrice = bRefundPrice;
                    jNewItem.refundTotalPrice = (Number(tempRefundPrice).div(100)).toFixed(2);
                    jNewItem.totalPrice = (Number(bTotalPrice).div(100)).toFixed(2);
                    jReturnItems[cartItemId] = jNewItem;
                }
            } else {

            }

        }

        result.totalPrice = (Number(totalProductRefundPrice).div(100)).toFixed(2);  //意向退款总金额 单位元
        result.totalProductRefundPrice = totalProductRefundPrice;  //意向退款总金额 单位:分
        result.returnProducts = jReturnItems;

        return result;
    }

    function getRefundInfo(jOrder, refundInfo, totalProductRefundPrice, totalOrderPayPrice, returnProducts) {
        var jRefunds = new selfApi.JSONArray();
        var afterOrderEventMaps = new selfApi.ConcurrentHashMapExt();
        afterOrderEventMaps.put("order_id", jOrder.optString("id"));
        afterOrderEventMaps.put("order_object", jOrder);
        afterOrderEventMaps.put("refundInfo", selfApi.StringUtils.isBlank(refundInfo) ? "" : refundInfo);
        afterOrderEventMaps.put("totalProductRefundPrice", totalProductRefundPrice + "");
        afterOrderEventMaps.put("totalOrderPayPrice", totalOrderPayPrice + "");
        afterOrderEventMaps.put("returnProducts", JSON.stringify(returnProducts));
        selfApi.AfterSaleEventBusUtils.doFrontEndBeforeAddReturnOrderEvents(selfApi.AfterOrderEventName.frontEndBeforeAddReturnOrderEvent.name(), afterOrderEventMaps);
        jRefunds = afterOrderEventMaps.get("jRefunds");
        return jRefunds;
    };

    var res = CommonUtil.initRes();
    try {
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

        var orderAliasCode = $.params.orderAliasCode;
        var opertType = "returnProduct";
        var selectReason = $.params.selectReason || "";
        var imgFileId = $.params.imgFileId || "";//图片id，多个图片id用英文逗号分隔
        var cusRemark = $.params.cusRemark || "";  //问题详细描述
        var contactPerson = "";  //联系人
        var mobilePhone = "";  //联系电话
        var items = $.params.items;  //申请售后的商品行信息

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
        var deliveryInfo = jOrder.deliveryInfo;
        if (deliveryInfo) {
            mobilePhone = deliveryInfo.mobile;
            contactPerson = deliveryInfo.userName;
        }

        var jCalcReturnProduct = getReturnProducts(jOrder, JSON.parse(items));
        //如果申请的数量大于可售后数量
        if (jCalcReturnProduct && jCalcReturnProduct.result && jCalcReturnProduct.result == "-1") {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00010, jCalcReturnProduct.msg);
            return;
        }
        var totalPrice = jCalcReturnProduct.totalPrice * 100;
        var totalProductRefundPrice = jCalcReturnProduct.totalProductRefundPrice;
        var returnProducts = jCalcReturnProduct.returnProducts;
        var fTotalProductRefundPrice = jCalcReturnProduct.totalPrice;  //
        var operatorInfo = {operatorId: loginUserId, operator: UserUtilService.getRealName(loginUser)};
        jOrder.operatorInfo = operatorInfo;

        //退款意向
        var jRefundInfo = getRefundInfo($.toJavaJSONObject(jOrder), "", totalProductRefundPrice, totalPrice, returnProducts) + "";
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
        jReturnOrderInfo.reason = JSON.parse(reason + "");
        jReturnOrderInfo.refundInfo = JSON.parse(jRefundInfo + "");
        jReturnOrderInfo.remark = "";
        jReturnOrderInfo.cusRemark = cusRemark;
        jReturnOrderInfo.dDeliveryPrice = "0";
        jReturnOrderInfo.totalRefundPrice = fTotalProductRefundPrice;
        jReturnOrderInfo.totalExpensePrice = fTotalProductRefundPrice;
        jReturnOrderInfo.returnImgFileIds = imgFileId;

        var jConfig = {};
        jConfig.isNeedApprove = true;
        jConfig.isNeedCheckRefundInfo = true;

        var jResult = selfApi.ReturnOrderAddUtil.addReturnOrder(loginUserId, $.toJavaJSONObject(jReturnOrderInfo), $.toJavaJSONObject(jConfig)) + "";
        jResult = JSON.parse(jResult);
        var data = {};
        if (jResult && jResult.code && jResult.code == "0") {
            data = jResult;
            CommonUtil.setRetData(res, data);
        } else {
            CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00006, jResult.msg);
        }
    } catch (e) {
        $.log(e);
        CommonUtil.setErrCode(res, ErrorCode.aftersale.E1D00006, jResult.msg);
    }
})();

function isEmptyObject(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
};