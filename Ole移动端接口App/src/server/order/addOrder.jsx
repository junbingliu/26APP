//#import Util.js
//#import product.js
//#import order.js
//#import login.js
//#import normalBuy.js
//#import cart.js
//#import payment.js
//#import account.js
//#import address.js
//#import saasRegion.js
//#import underscore.js
//#import userProfile.js
//#import DistributeUtil.js
//#import realPayRec.js
//#import storeCard.js
//#import session.js
//#import user.js
//#import md5Service.js
//#import column.js
//#import PreSale.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx
//#import @server/util/OrderUtil.jsx
//#import $paymentSetting:services/paymentSettingService.jsx
;
(function () {
    var beginTime = new Date().getTime();
    var merchantId = $.params.merchantId;//结算商家
    var exMerchantId = $.params.exm;//不包含结算商家
    var saveCertificate = $.params.saveCertificate;//是否保存身份证信息
    var certificate = $.params.certificate || ""; //身份证件，用于跨境电商
    var isGift = $.params.isGift;//是否赠品订单
    var giftRegionId = $.params.giftRegionId;//赠品订单的地区id
    var orderSource = $.params.source || "front";//订单来源
    var prepayCards = $.params.prepayCards;//预付卡支付信息
    var selectedCardBatchAmounts = $.params["selectedCardBatchAmounts"];//券支付金额
    var allCardRules = $.params["allCardRules"];//券规则信息
    var useIntegralMoney = $.params["integralPay"] || 0; //积分支付金额
    var description = $.params.memo || "";//订单备注
    var buyingDevice = $.params.buyingDevice || "";//购买的设备
    var selectedPaymentId = $.params.selectedPaymentId;//选择的支付方式
    var selectedPayInterfaceId = $.params.selectedPayInterfaceId || "payi_1";//选择的支付方式Id,payi_1:在线支付or payi_0:货到付款
    var selectedOcPayments = $.params.selectedOcPayments;//每个OC选择的payInterfaceId
    var promotionUserPhone = $.params.promotionUserPhone || "";//推广员手机号;
    var invoiceTitle = $.params.invoiceTitle || "";//发票抬头
    var orderType = $.params.orderType || "common";//订单类型
    var preSaleMobile = $.params.preSaleMobile || "";//预售通知手机号码
    var buyerId = LoginService.getFrontendUserId();

    var prepayCardInterfaceId = "payi_10";//预付卡支付方式id
    var integralInterfaceId = "payi_4";//积分支付方式id
    var onlineInterfaceId = "payi_1";//积分支付方式id
    var codInterfaceId = "payi_0";//货到付款支付方式id

    //$.log("........................add order.jsx get param cost:"+(new Date().getTime() - beginTime)+".........................");
    beginTime = new Date().getTime();

    var ret = ErrorCode.S0A00000;

    if (isGift) {
        isGift = true;
    } else {
        isGift = false;
    }
    var orderIds = [];
    var orderAliasCodes = [];
    try {
        if (!buyerId) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }
        var defaultAddress = AddressService.getDefaultAddress(buyerId);
        //$.log("........................add order.jsx get default address cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();
        //如果不是赠品订单，并且没有配送地址
        if (!defaultAddress && !isGift) {
            ret = ErrorCode.order.E1M01007;
            out.print(JSON.stringify(ret));
            return;
        }

        if (defaultAddress) {
            var hasChildren = ColumnService.hasChildren(defaultAddress.regionId);
            //var subRegions = SaasRegionService.getSubRegion(defaultAddress.regionId);
            //if (subRegions && subRegions.length > 0) {
            if (hasChildren) {
                ret = ErrorCode.order.E1M01008;
                out.print(JSON.stringify(ret));
                return;
            }
            if (!defaultAddress || !defaultAddress.userName) {
                ret = ErrorCode.order.E1M01009;
                out.print(JSON.stringify(ret));
                return;
            }
            //$.log("........................add order.jsx hasChildren cost:"+(new Date().getTime() - beginTime)+".........................");
            beginTime = new Date().getTime();
        }
        if (prepayCards) {
            prepayCards = JSON.parse(prepayCards);
        }
        if (prepayCards && prepayCards.length == 0) {
            prepayCards = null;
        }
        if (selectedOcPayments) {
            selectedOcPayments = JSON.parse(selectedOcPayments);
        }
        if (!selectedPayInterfaceId) {
            selectedPayInterfaceId = UserProfileService.getUserInfo(buyerId, "selectedPayInterfaceId");
            //$.log("........................add order.jsx get selectedPayInterfaceId cost:"+(new Date().getTime() - beginTime)+".........................");
            beginTime = new Date().getTime();
            if (!selectedPayInterfaceId) {
                ret = ErrorCode.order.E1M01010;
                out.print(JSON.stringify(ret));
                return;
            }
        }

        var defaultInvoice = {
            invoiceTitle: "无需发票",
            invoiceKey: "no",
            invoiceType: "普通发票",
            invoiceTypeKey: "com",
            invoiceTitleType: "单位"
        };
        if (invoiceTitle) {
            defaultInvoice.invoiceContent = "明细";
            defaultInvoice.invoiceTitle = invoiceTitle;
            defaultInvoice.invoiceKey = "yes";
        }
        /*defaultInvoice = InvoiceService.getDefaultInvoice(buyerId);
         if (!defaultInvoice) {
         defaultInvoice = {
         invoiceTitle: "无需发票",
         invoiceKey: "no",
         invoiceType: "普通发票",
         invoiceTitleType: "单位"
         }
         }*/

        var allCardBatches = [];
        var tempOcs = [];
        var ocs = NormalBuyFlowService.getOcsWithGift(buyerId, buyingDevice, orderType, true, null, isGift, giftRegionId);
        //$.log("........................add order.jsx get ocs cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();

        var totalProductPrice = 0;//商品总金额
        var totalOrderPrice = 0;//订单总金额
        var ArrayList = java.util.ArrayList;
        if (!merchantId) {
            merchantId = CartUtil.getOleMerchantId();
        }
        if (merchantId) {
            var mids = merchantId.split(",");
            var midList = new ArrayList(mids);
        }
        for (var i = 0; i < ocs.length; i++) {
            var oc = ocs[i];
            if (midList && !midList.contains(oc.merchantId)) {
                continue;
            }

            if (exMerchantId && (exMerchantId == oc.merchantId)) {
                continue;
            }

            //判断有没有选中要结算的商品行
            var hasCheckedItem = false;
            var buyItems = oc.buyItems;
            for (var j = 0; j < buyItems.length; j++) {
                var buyItem = buyItems[j];
                if (buyItem.checked) {
                    hasCheckedItem = true;
                    break;
                }
            }
            //如果没有选中商品,那就不结算
            if (!hasCheckedItem) {
                continue;
            }
            oc.description = description;
            oc.invoiceInfo = defaultInvoice;
            oc.invoiceInfo.invoiceKey = defaultInvoice.invoiceKey || "yes";
            oc.invoiceInfo.invoiceType = defaultInvoice.invoiceType || "普通发票";
            oc.invoiceInfo.invoiceTitleType = defaultInvoice.invoiceTitleType || "单位";
            if (oc.allCardBatches && oc.allCardBatches.length > 0) {
                allCardBatches = oc.allCardBatches;
            }
            //如果没有选择配送规则
            if (!oc.selectedDeliveryRuleId) {
                ret = ErrorCode.order.E1M01011;
                out.print(JSON.stringify(ret));
                return;
            }
            var effectivePayInterfaceId = selectedPayInterfaceId;
            if (selectedOcPayments && selectedOcPayments[oc.cartKey]) {
                effectivePayInterfaceId = selectedOcPayments[oc.cartKey];
            }
            if (selectedPayInterfaceId == codInterfaceId) {
                //如果用户选择了货到付款
                if (oc.selectedDeliveryRuleId) {
                    var isExistsCodPay;
                    for (var j = 0; j < oc.availableDeliveryRuleResults.length; j++) {
                        var rule = oc.availableDeliveryRuleResults[j];
                        if (rule.ruleId === oc.selectedDeliveryRuleId) {
                            if (rule.enableCOD) {
                                effectivePayInterfaceId = codInterfaceId;//货到付款
                                isExistsCodPay = true;
                                break;
                            } else {
                                effectivePayInterfaceId = onlineInterfaceId;//在线支付
                            }
                        }
                    }
                    //如果配送规则中没有支持货到付款的规则,那就将支付方式设置为在线支付
                    if (!isExistsCodPay || isExistsCodPay == false) {
                        effectivePayInterfaceId = onlineInterfaceId;
                    }
                }
            }
            var inheritPlatform = PaymentSettingService.getInheritPlatform(oc.merchantId);
            if (inheritPlatform) {
                oc.payMerchantId = "head_merchant";
            } else {
                oc.payMerchantId = oc.merchantId;
            }
            var payments = PaymentService.getPayments(oc.payMerchantId);
            for (var k = 0; k < payments.length; k++) {
                var payment = payments[k];
                if (payment.payInterfaceId == effectivePayInterfaceId) {
                    selectedPaymentId = payment.id;
                }
            }
            oc.selectedPaymentId = selectedPaymentId;
            oc.cartId = oc.cartKey;

            oc.supportIntegral = false;
            oc.supportStoreCard = false;
            if (payments) {
                payments.forEach(function (payment) {
                    //积分支付
                    if (payment.payInterfaceId == integralInterfaceId) {
                        oc.supportIntegral = true;
                    }
                    //预付卡支付
                    if (payment.payInterfaceId == prepayCardInterfaceId) {
                        oc.supportStoreCard = true;
                    }
                });
            }
            tempOcs.push(oc);
            totalOrderPrice += oc.finalPayAmount;
            totalProductPrice += (oc.finalPayAmount - oc.totalDeliveryFee);
        }
        //$.log("........................add order.jsx convert ocs cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();
        ocs = tempOcs;
        //如果没有选中要结算的商品行,那就返回错误,不能结算
        if (!ocs || ocs.length == 0) {
            ret = ErrorCode.order.E1M01012;
            out.print(JSON.stringify(ret));
            return;
        }
        //检查订单结算的商品是不是都是同一种类型的，常温，冷藏，冷冻
        for (var i = 0; i < ocs.length; i++) {
            var jOc = ocs[i];
            var checkResult = OrderUtil.checkProductType(jOc);
            if (checkResult.state != "ok") {
                ret = ErrorCode.order.E1M01033;
                out.print(JSON.stringify(ret));
                return;
            }
            jOc.temperatureControl = checkResult.temperatureControl;
        }
        //判断预售手机号码
        for (var i = 0; i < ocs.length; i++) {
            var jOc = ocs[i];
            if (jOc.orderType == "preSale") {
                var buyItems = oc.buyItems;
                var productId = "";
                for (var i = 0; i < buyItems.length; i++) {
                    var buyItem = buyItems[i];
                    productId = buyItem.productId;
                    break;
                }
                var preSaleRule = PreSaleService.getProductPreSaleRule(productId);
                if (preSaleRule.type != "3" && !preSaleMobile) {
                    ret = ErrorCode.order.E1M01034;
                    out.print(JSON.stringify(ret));
                    return;
                }
            }
        }
        //$.log("........................add order.jsx getProductPreSaleRule cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();

        //开始校验订单券规则
        //获取券规则
        $.log("------begin check order rule------");
        var cardRulesAd = [];
        for (var i = 0; i < ocs.length; i++) {
            var checkoc = ocs[i];
            if (!checkoc) {
                continue;
            }
            var availableRuleResults = checkoc.availableRuleResults;
            for (var x = 0; x < availableRuleResults.length; x++) {
                var ruleResultAd = availableRuleResults[x];
                //只返回订单用券和订单随机使用券规则
                if (ruleResultAd.type != "OUC" && ruleResultAd.type != "OURC") {
                    continue;
                }
                var overaddOtherOrderRuleStr = "1";
                var excludeOtherOrderRuleStr = "1";
                var overaddOtherOrderRule = ruleResultAd.overaddOtherOrderRule;
                if(overaddOtherOrderRule){
                    overaddOtherOrderRuleStr = "1";
                }else{
                    overaddOtherOrderRuleStr = "0";
                }
                var  excludeOtherOrderRule = ruleResultAd.excludeOtherOrderRule;
                if(excludeOtherOrderRule){
                    excludeOtherOrderRuleStr = "1";
                }else{
                    excludeOtherOrderRuleStr = "0";
                }
                ruleResultAd.availableCardRules.forEach(function (cardRule) {
                    if (cardRule.recommend) {
                        return;
                    }
                    ruleResultAd = {
                        type: ruleResultAd.type,//规则类型
                        ruleId: ruleResultAd.ruleId,//规则id
                        ruleName: ruleResultAd.ruleName,//规则名称
                        overaddOtherOrderRule: overaddOtherOrderRuleStr,//规则是否可叠加
                        excludeOtherOrderRule: excludeOtherOrderRuleStr,//规则是否互斥
                        availableBatches: cardRule.availableBatches,//可用的券列表
                        amount: cardRule.amount//可用金额
                    };
                    cardRulesAd.push(ruleResultAd);
                });
            }
        }
        if(selectedCardBatchAmounts && selectedCardBatchAmounts.length>0 && cardRulesAd && cardRulesAd.length>0){
            var checkRuleRet = OrderUtil.checkOrderCardRule(cardRulesAd,selectedCardBatchAmounts);
            var crStatus = checkRuleRet.state;
            if("1" == crStatus){
                ret.code = "E1M01040";
                ret.msg = checkRuleRet.msg;
                out.print(JSON.stringify(ret));
                return;
            }
        }
        //开始将卡分配到订单
        var totalUseCardAmount = OrderUtil.distributeCoupon(ocs, selectedCardBatchAmounts, allCardBatches);
        //$.log("........................add order.jsx distributeCoupon cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();

        //将积分分摊到各个订单
        OrderUtil.distributeIntegral(ocs, useIntegralMoney);
        //$.log("........................add order.jsx distributeIntegral cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();

        //分摊预付卡
        var prepayCardsTotalAmount = OrderUtil.distributePrepayCard(ocs, prepayCards);
        //$.log("........................add order.jsx distributePrepayCard cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();

        //如果积分与购物券支付金额大于商品金额
        var paidAmount = Number(totalUseCardAmount) + Number(useIntegralMoney);
        paidAmount = Number(paidAmount.toFixed(2));
        totalProductPrice = Number(totalProductPrice.toFixed(2));
        if (paidAmount > totalProductPrice) {
            ret = ErrorCode.order.E1M01013;
            ret.msg = "积分与购物券支付金额(" + paidAmount + ")不能大于商品总金额(" + totalProductPrice + ")。";
            out.print(JSON.stringify(ret));
            return;
        }
        //所有已支付金额大于订单总金额
        var totalPaidAmount = Number(totalUseCardAmount) + Number(useIntegralMoney) + Number(prepayCardsTotalAmount);
        totalPaidAmount = Number(totalPaidAmount.toFixed(2));
        totalOrderPrice = Number(totalOrderPrice.toFixed(2));
        if (totalPaidAmount > totalOrderPrice) {
            ret = ErrorCode.order.E1M01014;
            ret.msg = "已支付金额(" + totalPaidAmount.toFixed(2) + ")不能大于订单总金额(" + totalOrderPrice + ")。";
            out.print(JSON.stringify(ret));
            return;
        }
        if (Number(useIntegralMoney) > Number((totalProductPrice * 0.3).toFixed(2))) {
            ret = ErrorCode.order.E1M01032;
            out.print(JSON.stringify(ret));
            return;
        }

        if (prepayCards) {
            var payToPlatformPayments = PaymentService.getMerchantAllPaymentsByOrderType("head_merchant", orderType);
            var effectivePaymentId = null;
            var effectivePaymentName = "预付卡支付";
            payToPlatformPayments.forEach(function (payment) {
                if (payment.objectMap.payInterfaceId == prepayCardInterfaceId) {
                    effectivePaymentId = "" + payment.objectMap.id;
                    effectivePaymentName = "" + payment.objectMap.paymentName;
                }
            });

            //生成realPayRec
            var now = (new Date()).getTime();
            var realPayRec = {
                merchantId: "head_merchant",
                needPayMoneyAmount: (prepayCardsTotalAmount * 100).toFixed(2),
                createTime: now,
                lastModifyTime: now,
                payState: "uncertain",
                payInterfaceId: prepayCardInterfaceId,
                integralPoints: 0,
                integralMoneyRatio: 0,
                paymentName: effectivePaymentName,
                paymentId: effectivePaymentId,
                ip: $.getClientIp(),
                bankCode: "",
                userId: buyerId
            };
            var realPayRecId = RealPayRecordService.addRealPayRecord(realPayRec);
            //真正支付
            var prepayCards = prepayCards.map(function (card) {
                return {
                    cardNumber: card.cardNo,
                    cardId: card.cardId,
                    usedAmount: (card.useAmount * 100).toFixed(2)
                }
            });
        }
        //$.log("........................add order.jsx addRealPayRecord cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();
        //生成订单
        ocs.forEach(function (oc) {
            var inheritPlatform = PaymentSettingService.getInheritPlatform(oc.merchantId);
            if (inheritPlatform) {
                oc.payMerchantId = "head_merchant";
            }
            else {
                oc.payMerchantId = oc.merchantId;
            }
            oc.isGift = isGift;
            oc.giftRegionId = giftRegionId;
            var order = NormalBuyFlowService.convertOcToOrder(oc);
            order["isGift"] = isGift;
            if (isGift) {
                order["receiverCompleted"] = false;
            }
            if (order.ruleResults) {
                if (oc.ocRuleResults) {
                    order.ruleResults = order.ruleResults.concat(oc.ocRuleResults);
                }
            }
            else {
                if (oc.ocRuleResults) {
                    order.ruleResults = oc.ocRuleResults;
                }
            }
            order.buyingDevice = buyingDevice;
            order.promotionUserPhone = promotionUserPhone;
            order.certificate = certificate;
            order.orderSource = orderSource;
            order.temperatureControl = oc.temperatureControl;
            if (preSaleMobile) {
                order.preSaleMobile = preSaleMobile;
            }
            //真正保存订单
            var orderId = "" + NormalBuyFlowService.addRealOrder(order, orderType, buyerId);
            orderIds.push(orderId);

            //成功一个就删除一个购物车
            CartService.removeCheckedItems(oc.cartId);
        });
        //$.log("........................add order.jsx add order cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();
        //保存身份证号码到地址中
        if (certificate && defaultAddress && saveCertificate == "true") {
            //加密
            defaultAddress.certificate = Md5Service.encString(certificate, "!@#$%^") + "";
            AddressService.saveAddress(buyerId, defaultAddress);
        }
        //$.log("........................add order.jsx saveAddress cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();

        var orders = [];
        var prepayCardPayRecs = [];
        var prepayCardPayRecIds = [];
        orderIds.forEach(function (orderId) {
            var order = OrderService.getOrder(orderId);
            orderAliasCodes.push(order.aliasCode);
            if (order.payRecs) {
                for (k in order.payRecs) {
                    var payRec = order.payRecs[k];
                    if (payRec.payInterfaceId == prepayCardInterfaceId) {
                        prepayCardPayRecIds.push(orderId + "%" + payRec.payRecId);
                        prepayCardPayRecs.push(payRec);
                    }
                }
            }
            orders.push(order);
        });

        //调用预付卡支付接口
        if (prepayCards && prepayCards.length > 0) {
            var payResult = StoreCardService.useStoredCardPay(prepayCards, "head_merchant", "", realPayRecId, $.getClientIp(), "下单支付");
            //$.log("........................add order.jsx useStoredCardPay cost:"+(new Date().getTime() - beginTime)+".........................");
            beginTime = new Date().getTime();
            if (payResult.status == '0') {//支付成功，修改支付记录状态
                if (realPayRecId) {
                    var internalId = OrderService.getOrderIdByOrderPayRecId(realPayRecId);
                    var realPayRec = RealPayRecordService.getPayRec(internalId);
                    realPayRec.payState = "paid";
                    realPayRec.bankSN = payResult.msg;
                    realPayRec.paidTime = now;
                    realPayRec.orderIds = orderIds.join(",");
                    realPayRec.orderAliasCodes = orderAliasCodes.join(",");
                    realPayRec.payRecordIds = prepayCardPayRecIds.join(",");
                    realPayRec.paidMoneyAmount = realPayRec.needPayMoneyAmount;//储值卡没有部分支付的情况,所以已支付金额=需支付金额
                    RealPayRecordService.updateRealPayRecord(internalId, realPayRec);
                }
            } else {//支付失败
                ret = ErrorCode.order.E1M01015;
                ret.msg = "预付卡支付失败。" + (payResult.msg || "");
                out.print(JSON.stringify(ret));
                return;
            }
        }
        var totalNeedPay = 0;
        orderIds.forEach(function (orderId) {
            var jOrder = OrderService.getOrder(orderId);
            var preSaleRuleId = jOrder.preSaleRuleId;
            if (preSaleRuleId) {
                var jPreSaleRule = PreSaleService.getPreSaleRuleById(preSaleRuleId);
                if (jPreSaleRule) {
                    if (jPreSaleRule.type == "3") {
                        totalNeedPay += Number(jOrder.priceInfo.fTotalOrderNeedPayPrice)
                    } else {
                        totalNeedPay += Number(jOrder.priceInfo.fTotalDepositPrice)
                    }
                }
            } else {
                totalNeedPay += Number(jOrder.priceInfo.fTotalOrderNeedPayPrice);
            }
        });
        ret.data = {
            orderIds: orderAliasCodes.join(","),
            totalNeedPayPrice: totalNeedPay.toFixed(2)
        };
        //$.log("........................add order.jsx getOrder cost:"+(new Date().getTime() - beginTime)+".........................");
        beginTime = new Date().getTime();
        out.print(JSON.stringify(ret));
    } catch (e) {
        //throw e;
        if (orderIds.length > 0) {
            //如果出错的时候已经生成了不分的订单，
            //需要取消这些订单
            orderIds.forEach(function (orderId) {
                OrderService.updateOrderState(orderId, "processState", "p111", "u_0", "system", "下单失败取消订单", "platform");
            });
        }
        var msg = "";
        try {
            msg = e.getMessage();
        } catch (ex) {
            msg = e.toString();
        }
        var idx300 = msg.indexOf("300");
        if (idx300 > -1) {
            msg = msg.substring(idx300 + 3);
        }
        if (msg.indexOf("xception:") > -1) {
            var idx = msg.lastIndexOf("xception:");
            msg = msg.substring(idx + 9);
        }
        //截取APP抛的异常信息
        if (msg.indexOf("(<cmd>#") > -1) {
            var idx = msg.lastIndexOf("(<cmd>#");
            msg = msg.substring(0, idx);
        }
        ret = ErrorCode.E1M000002;
        ret.msg = "" + msg;
        out.print(JSON.stringify(ret));
    }
})();