//#import Util.js
//#import cart.js
//#import normalBuy.js
//#import login.js
//#import address.js
//#import delivery.js
//#import payment.js
//#import userProfile.js
//#import invoice.js
//#import account.js
//#import saasRegion.js
//#import merchant.js
//#import session.js
//#import user.js
//#import DateUtil.js
//#import md5Service.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx
;
(function () {
    var ret = ErrorCode.S0A00000;
    var ArrayList = java.util.ArrayList;
    var cartId = $.params.cartId;
    var merchantId = $.params.merchantId;//结算商家
    var exMerchantId = $.params.exm || "";//不包含结算商家
    var buyingDevice = $.params.buyingDevice || "";
    var isGift = $.params.isGift;
    var orderType = $.params.orderType || "common";
    var giftRegionId = $.params.giftRegionId;
    var spec = $.params['spec'] || '202X218';//图片规格
    if (isGift && isGift != "false") {
        isGift = true;
    } else {
        isGift = false;
    }
    if (!merchantId) {
        merchantId = CartUtil.getOleMerchantId();
    }
    var beginTime = new Date().getTime();
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }

    var defaultAddress = AddressService.getDefaultAddress(userId);
    if (defaultAddress) {
        if (defaultAddress.selectedDeliveryRuleIds) {
            //不要把所有商户里选择的配送方式发送到客户端
            defaultAddress.selectedDeliveryRuleIds = null;
        }
        if (!defaultAddress.regionName) {
            defaultAddress.regionName = SaasRegionService.getFullPathString(defaultAddress.regionId);
        }
        if (defaultAddress.certificate) {
            //解密身份证信息
            defaultAddress.certificate = Md5Service.decString(defaultAddress.certificate, "!@#$%^") + "";
        }
        defaultAddress = {
            id: defaultAddress.id,
            regionName: defaultAddress.regionName,//收货地区
            address: defaultAddress.address,//收货地址
            certificate: defaultAddress.certificate,//身份证号
            isDefault: defaultAddress.isDefault,//是否默认地址
            userName: defaultAddress.userName,//收货人信息
            mobile: defaultAddress.phone//收货人手机号
        };
        if (defaultAddress.regionName.indexOf("中国") == 0) {
            defaultAddress.regionName = defaultAddress.regionName.substring(2, defaultAddress.regionName.length);
            defaultAddress.address = defaultAddress.regionName + defaultAddress.address;
        }
    }
    $.log("..................process address cost time:"+(new Date().getTime() - beginTime));
    beginTime = new Date().getTime();
    var selectedPayments = {};//存放每个oc选中的paymentId
    var selectedPayInterfaceId = UserProfileService.getUserInfo(userId, "payInterfaceId");

    var jUser = UserService.getUser(userId);
    var ocs = NormalBuyFlowService.getOcsWithGift(userId, buyingDevice, orderType, true, spec, isGift, giftRegionId);
    if (ocs != null) {
        ocs.forEach(function (oc, index) {
            if (merchantId) {
                var mids = merchantId.split(",");
                var midList = new ArrayList(mids);
                if (!midList.contains(oc.merchantId)) {
                    ocs[index] = {};
                    return;
                }
            }
            if (exMerchantId && (exMerchantId == oc.merchantId)) {
                ocs[index] = {};
                return;
            }
            var paymentList = [];//PaymentService.getPaymentsForMobile(merchantId);
            //如果配送方式里面有支持COD的，才取出COD支付方式
            var supportCod = false;
            if (!isGift) {
                //如果是送礼就不支持货到付款
                if (oc.availableDeliveryRuleResults) {
                    oc.availableDeliveryRuleResults.forEach(function (rule) {
                        if (rule.enableCOD) {
                            supportCod = true;
                        }
                    });
                }
            }

            var inheritPlatform = PaymentSettingService.getInheritPlatform(oc.merchantId);
            if (inheritPlatform) {
                oc.payMerchantId = "head_merchant";
            } else {
                oc.payMerchantId = oc.merchantId;
            }
            if (supportCod) {
                var codPayment = PaymentService.getCodPayment(oc.payMerchantId);
                if (codPayment) {
                    codPayment.isOnline = false;
                    codPayment.isCod = true;
                    codPayment.desc = "送货上门后再收款、支持现金、pos机刷卡、支票支付 查看服务及配送范围";
                    paymentList.push(codPayment);
                }
            }

            var onlinePayment = PaymentService.getOnlinePayment(oc.payMerchantId);
            if (onlinePayment) {
                onlinePayment.isOnline = true;
                onlinePayment.isCod = false;
                onlinePayment.desc = "即时到帐，支持绝大数银行借记卡及部分银行信用卡";
                paymentList.push(onlinePayment);
            }


            var selectedPaymentId = null;
            if (selectedPayInterfaceId) {
                paymentList.forEach(function (elem) {
                    if (elem.payInterfaceId == selectedPayInterfaceId) {
                        selectedPaymentId = elem.id;
                    }
                });
            }

            paymentList = paymentList.map(function (payment) {
                return {
                    id: payment.id,
                    name: payment.paymentName,
                    payInterfaceId: payment.payInterfaceId,
                    isOnline: payment.isOnline,
                    isCod: payment.isCod,
                    desc: payment.desc
                };
            });
            oc.supportIntegral = false;
            oc.supportStoreCard = false;
            oc.supportPreDeposit = false;
            oc.supportTicket = false;
            oc.supportJiaJuQuan = false;
            //根据订单类型取订单适用范围内的支付方式
            var payments = PaymentService.getMerchantAllPaymentsByOrderType(oc.payMerchantId, oc.orderType);
            if (payments) {
                payments.forEach(function (payment) {
                    if (payment.objectMap.payInterfaceId == 'payi_2') {
                        oc.supportTicket = true;//购物券
                    } else if (payment.objectMap.payInterfaceId == 'payi_4') {
                        oc.supportIntegral = true;//积分
                    } else if (payment.objectMap.payInterfaceId == 'payi_5') {
                        oc.supportPreDeposit = true;//预存款
                    } else if (payment.objectMap.payInterfaceId == 'payi_10') {
                        oc.supportStoreCard = true;//预付卡
                    } else if (payment.objectMap.payInterfaceId == 'payi_160') {
                        oc.supportJiaJuQuan = true;//家居券
                    }
                });
            }
            oc.paymentList = paymentList;
            oc.selectedPaymentId = selectedPaymentId;
            if (selectedPaymentId) {
                oc.selectedPayInterfaceId = selectedPayInterfaceId;
                selectedPayments[oc.cartKey] = selectedPayInterfaceId;
            } else {
                //如果没有可选的payInterfaceId，要给一个在线支付的支付方式
                selectedPayments[oc.cartKey] = "payi_1";
                oc.selectedPayInterfaceId = null;
            }
        });
    }
    $.log("..................process get ocs cost time:"+(new Date().getTime() - beginTime));
    beginTime = new Date().getTime();

    //优化toFixed bug问题
    function toFixed(num, dec) {
        if (!dec) {
            dec = 2;
        }
        return Number(num).toFixed(dec);
        //return +(Math.round(+(num.toString() + 'e' + dec)).toString() + 'e' + -dec);
    }

    var newOcs = [];
    var now = new Date().getTime();
    var totalOrderPayPrice = 0;
    for (var i = 0; i < ocs.length; i++) {
        var oc = ocs[i];
        if (!oc) {
            continue;
        }
        var buyItems = oc.buyItems;
        if (!buyItems || buyItems.length == 0) {
            continue;
        }
        var allCards = [];
        oc.allCardBatches.forEach(function (cardBatch) {
            var effectedBegin = DateUtil.getShortDate(cardBatch.effectedBegin);
            var effectedEnd = DateUtil.getShortDate(cardBatch.effectedEnd);
            allCards.push({
                id: cardBatch.id,//批次id
                name: cardBatch.name,//批次名称
                faceValue: cardBatch.faceValue,//面值
                maxUseAmount: cardBatch.maxUseAmount,//最大使用金额
                cardCount: cardBatch.allCards.length,//卡数量
                ruleRemarkDes: cardBatch.ruleRemarkDes,//使用规则备注
                effectedBegin: effectedBegin,//有效期开始日期
                effectedEnd: effectedEnd//有效期结束日期
            });
        });
        oc.allCardBatchs = allCards;
        var cardRules = [];
        var newItems = [];
        var productId = '';
        var deliveryWay = "0";
        for (var k = 0; k < buyItems.length; k++) {
            var buyItem = buyItems[k];
            var availableRuleResults = buyItem.availableRuleResults;
            //获取单品用券规则
            for (var x = 0; x < availableRuleResults.length; x++) {
                var ruleResult = availableRuleResults[x];
                if (ruleResult.type != "puc") {
                    continue;
                }
                ruleResult.availableCardRules.forEach(function (cardRule) {
                    if (cardRule.recommend) {
                        return;
                    }
                    ruleResult = {
                        type: ruleResult.type,//规则类型
                        ruleId: ruleResult.ruleId,//规则id
                        ruleName: ruleResult.ruleName,//规则名称
                        availableBatches: cardRule.availableBatches,//可用的券列表
                        amount: cardRule.amount//可用金额
                    };
                    cardRules.push(ruleResult);
                });
            }
            //如果还没有到预售定金开始支付时间或者已经过了预售定金结束支付时间,那么这个预售商品不能结算
            if (buyItem.objType == "preSale" && (buyItem.depositBeginTime > now || buyItem.depositEndTime < now)) {
                continue;
            }
            productId = buyItem.productId;
            deliveryWay = buyItem.deliveryWay;
            buyItem = {
                icon: buyItem.icon,
                productName: buyItem.productName,
                attrsString: buyItem.attrsString,
                amount: buyItem.number,
                productId: buyItem.productId,
                skuId: buyItem.skuId,
                realSkuId: buyItem.realSkuId,
                sellUnitName: buyItem.sellUnitName,
                cartId: buyItem.cartId,
                itemId: buyItem.itemKey,
                taxPrice: toFixed(buyItem.taxPrice),
                totalPrice: toFixed(buyItem.totalPrice),
                unitPrice: toFixed(buyItem.unitPrice),
                unitDealPrice: toFixed(buyItem.unitDealPrice),
                totalDealPrice: toFixed(buyItem.totalDealPrice),
                totalTaxPrice: toFixed(buyItem.totalTaxPrice),
                depositPrice: toFixed(buyItem.depositPrice),
                balancePrice: toFixed(buyItem.balancePrice),
                totalDepositPrice: toFixed(buyItem.totalDepositPrice),
                totalBalancePrice: toFixed(buyItem.totalBalancePrice),
                integralPrice: toFixed(buyItem.integralPrice),
                totalIntegralPrice: toFixed(buyItem.totalIntegralPrice)
            };
            newItems.push(buyItem);
        }
        var availableRuleResults = oc.availableRuleResults;
        $.log("------begin get order rule------");
        //获取订单用券规则
        for (var x = 0; x < availableRuleResults.length; x++) {
            $.log("------come in for xunhuan------");
            var ruleResult = availableRuleResults[x];
            //只返回订单用券和订单随机使用券规则
            if (ruleResult.type != "OUC" && ruleResult.type != "OURC") {
                continue;
            }
            $.log("------get rule value------");
            var overaddOtherOrderRuleStr = "1";
            var excludeOtherOrderRuleStr = "1";
            var overaddOtherOrderRule = ruleResult.overaddOtherOrderRule;
            if (overaddOtherOrderRule) {
                overaddOtherOrderRuleStr = "1";
            } else {
                overaddOtherOrderRuleStr = "0";
            }
            var excludeOtherOrderRule = ruleResult.excludeOtherOrderRule;
            if (excludeOtherOrderRule) {
                excludeOtherOrderRuleStr = "1";
            } else {
                excludeOtherOrderRuleStr = "0";
            }
            $.log("------get rule value1------");
            ruleResult.availableCardRules.forEach(function (cardRule) {
                if (cardRule.recommend) {
                    return;
                }
                ruleResult = {
                    type: ruleResult.type,//规则类型
                    ruleId: ruleResult.ruleId,//规则id
                    ruleName: ruleResult.ruleName,//规则名称
                    overaddOtherOrderRule: overaddOtherOrderRuleStr,//规则是否可叠加
                    excludeOtherOrderRule: excludeOtherOrderRuleStr,//规则是否互斥
                    availableBatches: cardRule.availableBatches,//可用的券列表
                    amount: cardRule.amount//可用金额
                };
                cardRules.push(ruleResult);
            });
            $.log("------get rule value2------");
        }
        $.log("------end for xunhuan------");
        oc.allCardRules = cardRules;
        var deliveryRules = [];
        var availableDeliveryRuleResults = oc.availableDeliveryRuleResults;
        if (availableDeliveryRuleResults && availableDeliveryRuleResults.length > 0) {
            for (var k = 0; k < availableDeliveryRuleResults.length; k++) {
                var deliveryRule = availableDeliveryRuleResults[k];
                deliveryRule = {
                    id: deliveryRule.ruleId,
                    name: deliveryRule.name,
                    remark: deliveryRule.remark,//配送规则备注
                    totalPrice: toFixed(deliveryRule.totalPriceString),
                    description: deliveryRule.description//计费公式备注
                };
                deliveryRules.push(deliveryRule);
            }
        }
        if (oc.selectedDeliveryRule) {
            oc.selectedDeliveryRule = {
                id: oc.selectedDeliveryRuleResult.ruleId,
                name: oc.selectedDeliveryRuleResult.name,
                totalPrice: toFixed(oc.selectedDeliveryRuleResult.totalPriceString),
                description: oc.selectedDeliveryRuleResult.description
            };
        }
        var totalPayPrice = toFixed(oc.finalPayAmount);//默认订单支付金额
        oc = {
            merchantName: oc.merchantName,
            deliveryWay: deliveryWay,//配送方式
            totalDepositPrice: toFixed(oc.totalDepositPrice),
            totalBalancePrice: toFixed(oc.totalBalancePrice),
            totalOrderProductPrice: toFixed(oc.totalOrderProductPrice),
            totalIntegralPrice: toFixed(oc.totalIntegralPrice),
            totalDeliveryFee: oc.totalDeliveryFee,
            totalGoodsNum: oc.totalGoodsNum,
            totalTaxPrice: toFixed(oc.totalTaxPrice),
            selectedDeliveryRuleId: oc.selectedDeliveryRuleId,
            selectedDeliveryRule: oc.selectedDeliveryRule,
            paymentList: oc.paymentList,
            availableDeliveryRuleResults: deliveryRules,
            totalPayPrice: totalPayPrice,
            totalDiscountPrice: toFixed(oc.totalDiscountIncludeDeliveryFeeDiscount),
            allCardRules: oc.allCardRules,
            allCardBatchs: oc.allCardBatchs,
            totalWeight: oc.totalWeight
        };
        oc.buyItems = newItems;
        var preSaleRule = PreSaleService.getProductPreSaleRule(productId);
        if (preSaleRule) {
            oc.depositBeginTime = preSaleRule.depositBeginTime;//支付开始支付时间
            oc.depositEndTime = preSaleRule.depositEndTime;//支付结束支付时间
            oc.balanceBeginTime = preSaleRule.beginTime;//尾款开始支付时间
            oc.balanceEndTime = preSaleRule.endTime;//尾款结束支付时间
            oc.preSaleType = preSaleRule.type;//预售类型，1，先定金，后尾款，2，先定金，尾款按人数确认，3，全款
            if (orderType == "preSale" && (oc.preSaleType == "1" || oc.preSaleType == "2")) {//如果是预售订单，则支付金额改成定金金额
                oc.totalPayPrice = toFixed(oc.totalDepositPrice);
                oc.totalDeliveryFee = '0.00';//支付定金时，不需要支付运费
            }
        }
        if (oc.buyItems.length > 0) {
            newOcs.push(oc);
        }
        totalOrderPayPrice += Number(oc.totalPayPrice - oc.totalDeliveryFee);
    }
    if (newOcs.length == 0) {
        ret = ErrorCode.order.E1M01012;
        out.print(JSON.stringify(ret));
        return;
    }
    $.log("..................process covert ocs cost time:"+(new Date().getTime() - beginTime));
    beginTime = new Date().getTime();

    var userTradeInfo = UserService.getUserTradeInfo(userId);
    var saveCertificate = userTradeInfo && userTradeInfo.saveCertificate || "";
    var defaultInvoice = InvoiceService.getDefaultInvoice(userId);
    if (defaultInvoice) {
        defaultInvoice = {
            id: defaultInvoice.id,
            taxCode: defaultInvoice.taxCode,
            invoiceTitle: defaultInvoice.invoiceTitle,
            invoiceContent: defaultInvoice.invoiceContent,
            invoiceTypeKey: defaultInvoice.invoiceTypeKey
        };
    }
    $.log("..................process user trade info cost time:"+(new Date().getTime() - beginTime));
    beginTime = new Date().getTime();

    var integralMoneyRatio = 0 + AccountService.getIntegralMoneyRatio();
    //获得用户拥有的积分
    var integralBalance = 0;
    var integralUseAmount = 0;//最多能使用的积分（积分值）
    try {
        //只有绑定了会员卡的会员才取积分
        // if (jUser.memberid && jUser.memberid != "0") {
            integralBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "shoppingIntegral");
        // }
    } catch (e) {
        $.log("获取线下会员积分失败：" + e);
    }
    if (integralBalance > 0) {
        integralUseAmount = integralBalance;//将积分转换成人民币(元)
        var maxUseMoney = toFixed(totalOrderPayPrice / integralMoneyRatio * 0.3);//将订单的30%转换成积分值
        if (Number(integralUseAmount) > Number(maxUseMoney)) {
            integralUseAmount = maxUseMoney;
        }
    }
    $.log("..................process user integral cost time:"+(new Date().getTime() - beginTime));
    beginTime = new Date().getTime();
    ret.data = {
        deliveryAddress: defaultAddress,
        ocs: newOcs,
        buyerMobile: jUser.mobilPhone || "",
        invoiceInfo: defaultInvoice,
        integralBalance: integralBalance,
        integralMoneyRatio: integralMoneyRatio,
        saveCertificate: saveCertificate,
        integralUseAmount: integralUseAmount
    };

    out.print(JSON.stringify(ret));
})();

