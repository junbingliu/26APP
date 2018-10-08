//#import Util.js
//#import product.js
//#import order.js
//#import login.js
//#import normalBuy.js
//#import cart.js
//#import card.js
//#import invoice.js
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
//#import $paymentSetting:services/paymentSettingService.jsx
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx

;
(function () {
    var ArrayList = java.util.ArrayList;

    var merchantId = $.params.merchantId;//结算商家
    var exMerchantId = $.params.exm;//不包含结算商家
    var saveCertificate = $.params.saveCertificate;//是否保存身份证信息
    var certificate = $.params.certificate || ""; //身份证件，用于跨境电商
    var idCardFrontPic = $.params.idCardFrontPic || ""; //身份证正面
    var idCardBackPic = $.params.idCardBackPic || ""; //身份证反面
    var isGift = $.params.isGift;
    var giftRegionId = $.params.giftRegionId;
    if (isGift && isGift != "false") {
        isGift = true;
    } else {
        isGift = false;
    }
    var orderIds = [];
    try {
        var orderSource = $.params.source || "front";
        var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        if (!buyerId) {
            buyerId = LoginService.getFrontendUserId();
        }
        if (!buyerId) {
            var ret = {
                state: 'err',
                code: "notLogin",
                msg: "您还没有登录,请登录后再结算！"
            };
            out.print(JSON.stringify(ret));
            return;
        }

        var jUser = UserService.getUser(buyerId);

        var defaultAddress = AddressService.getDefaultAddress(buyerId);
        //如果不是赠品订单，并且没有配送地址
        if (!defaultAddress && !isGift) {
            var ret = {
                state: 'err',
                code: "notLogin",
                msg: "您还没有选择配送地址，请选择配送地址后再提交！"
            };
            out.print(JSON.stringify(ret));
            return;
        }
        if (defaultAddress) {
            var subRegions = SaasRegionService.getSubRegion(defaultAddress.regionId);
            if (subRegions && subRegions.length > 0) {
                var ret = {
                    state: 'err',
                    code: "address",
                    msg: "地址没有选择到最后一级！"
                };
                out.print(JSON.stringify(ret));
                return;
            }
            if (!defaultAddress || !defaultAddress.userName) {
                var ret = {
                    state: 'err',
                    code: "address",
                    msg: "收货人姓名不能为空,请填写收货人姓名！"
                };
                out.print(JSON.stringify(ret));
                return;
            }
        }
        var addressState = defaultAddress.state || "0";
        var description = $.params.memo;
        var buyingDevice = $.params.buyingDevice;
        var selectedPaymentId = $.params.selectedPaymentId;
        var idCard = "";
        var selectedPayInterfaceId = $.params.selectedPayInterfaceId;
        var selectedOcPayments = $.params.selectedOcPayments;//每个OC选择的payInterfaceId
        if (selectedOcPayments) {
            selectedOcPayments = JSON.parse(selectedOcPayments);
        }
        if (!selectedPayInterfaceId) {
            selectedPayInterfaceId = UserProfileService.getUserInfo(buyerId, "payInterfaceId");
            if (!selectedPayInterfaceId) {
                var ret = {
                    state: "err",
                    code: "selectedPayInterfaceId",
                    msg: "请选择支付方式"
                };
                out.print(JSON.stringify(ret));
                return;
            }
        }
        if (!idCard) {
            idCard = UserProfileService.getUserInfo( buyerId, "idCard" );
        }
        var defaultInvoice = InvoiceService.getDefaultInvoice(buyerId);
        if (!defaultInvoice) {
            defaultInvoice = {
                invoiceTitle: "无需发票",
                invoiceKey: "no",
                invoiceType: "普通发票",
                invoiceTitleType: "单位"
            }
        }

        var ocs = [];
        var allCardBatches = [];
        var tempOcs = [];

        ocs = NormalBuyFlowService.getOcsWithGift(buyerId, buyingDevice, "common", true, null, isGift, giftRegionId);

        var totalProductPrice = 0;//商品总金额
        var totalOrderPrice = 0;//订单总金额
        for (var i = 0; i < ocs.length; i++) {
            var oc = ocs[i]

            if (merchantId) {
                var mids = merchantId.split(",");
                var midList = new ArrayList(mids);

                if (!midList.contains(oc.merchantId)) {
                    continue;
                }
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
            //跨境订单不开发票
            if (oc.crossBorder) {
                oc.invoiceInfo = {};
            } else {
                oc.invoiceInfo = defaultInvoice;
                oc.invoiceInfo.invoiceKey = defaultInvoice.invoiceKey || "yes";
                oc.invoiceInfo.invoiceType = defaultInvoice.invoiceType || "普通发票";
                oc.invoiceInfo.invoiceTitleType = defaultInvoice.invoiceTitleType || "单位";
            }
            if (oc.allCardBatches && oc.allCardBatches.length > 0) {
                allCardBatches = oc.allCardBatches;
            }
            //如果没有选择配送规则
            if (!oc.selectedDeliveryRuleId) {
                var ret = {
                    state: "err",
                    code: "selectDeliveryRule",
                    msg: "请选择配送方式"
                };
                out.print(JSON.stringify(ret));
                return;
            }
            var effectivePayInterfaceId = selectedPayInterfaceId;
            if (selectedOcPayments && selectedOcPayments[oc.cartKey]) {
                effectivePayInterfaceId = selectedOcPayments[oc.cartKey];
            }
            if (selectedPayInterfaceId == "payi_0") {
                //如果用户选择了货到付款
                if (oc.selectedDeliveryRuleId) {
                    var isExistsCodPay;
                    for (var j = 0; j < oc.availableDeliveryRuleResults.length; j++) {
                        var rule = oc.availableDeliveryRuleResults[j];
                        if (rule.ruleId === oc.selectedDeliveryRuleId) {
                            if (rule.enableCOD) {
                                effectivePayInterfaceId = "payi_0";
                                isExistsCodPay = true;
                                break;
                            }
                            else {
                                effectivePayInterfaceId = "payi_1";
                            }
                        }
                    }
                    //如果配送规则中没有支持货到付款的规则,那就将支付方式设置为在线支付
                    if (!isExistsCodPay || isExistsCodPay == false) {
                        effectivePayInterfaceId = "payi_1";
                    }
                }
            }

            var inheritPlatform = PaymentSettingService.getInheritPlatform(oc.merchantId);
            if (inheritPlatform) {
                oc.payMerchantId = "head_merchant";
            }
            else {
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
                    if (payment.payInterfaceId == 'payi_4') {
                        oc.supportIntegral = true;
                    }
                    if (payment.payInterfaceId == 'payi_10') {
                        oc.supportStoreCard = true;
                    }
                });
            }
            tempOcs.push(oc);
            totalOrderPrice += oc.finalPayAmount;
            totalProductPrice += (oc.finalPayAmount - oc.finalDeliveryFee);
        }
        ocs = tempOcs;
        //如果没有选中要结算的商品行,那就返回错误,不能结算
        if (!ocs || ocs.length == 0) {
            var ret = {
                state: "err",
                code: "noProduct",
                msg: "没有要结算的商品"
            };
            out.print(JSON.stringify(ret));
            return;
        }

        //开始将卡分配到订单
        allCardBatches = CardService.getUserCardBatches(buyerId);
        var selectedCardBatchAmounts = $.params["selectedCardBatchAmounts"];
        if (selectedCardBatchAmounts && selectedCardBatchAmounts.length > 0) {
            var batchAmounts = JSON.parse(selectedCardBatchAmounts);

            batchAmounts.forEach(function (selectedCardBatch) {
                var found = false;
                allCardBatches.forEach(function (availableBatch) {
                    if (availableBatch.id == selectedCardBatch.cardBatchId) {
                        selectedCardBatch.faceValue = availableBatch.faceValue;
                        if (selectedCardBatch.selectedNumber > availableBatch.allCards.length) {
                            selectedCardBatch.selectedNumber = availableBatch.allCards.length;
                        }
                    }
                });
            });

            //begin v3 的内容
            var bigCart = CartService.getNativeBigCart(false);
            CartService.upgrade(bigCart);
            CartService.populatePrices(bigCart, buyerId, 0, true);

            var isDirty = CartService.executePlans(bigCart, buyerId, 10 * 60 * 1000, true);
            CartService.calculateDeliveryRulesForAll(bigCart, buyerId);

            var jCrossOrderRules = bigCart.optJSONObject("orderRules");
            var crossOrderRules = null;

            if (jCrossOrderRules != null) {
                crossOrderRules = JSON.parse("" + jCrossOrderRules.toString());
            }
            var crossOrderRuleResults = [];
            if (crossOrderRules) {
                //$.log("........33333333333333.........crossOrderRules=" + JSON.stringify(crossOrderRules));
                for (var ruleId in crossOrderRules) {
                    var crossOrderRule = crossOrderRules[ruleId];
                    if (crossOrderRule && crossOrderRule.result) {
                        crossOrderRule.result.itemIds = crossOrderRule.items;
                        crossOrderRuleResults.push(crossOrderRule.result);
                    }
                }
            }
            //$.log("........33333333333333.........crossOrderRuleResults=" + JSON.stringify(crossOrderRuleResults));
            //end v3的内容

            var ruleResults = NormalBuyFlowService.distributeCards(ocs, batchAmounts, crossOrderRuleResults);
            var usedCardIs = [];
            var totalUseCardAmount = 0;
            ocs.forEach(function (oc) {
                //获得用户所有的卡
                var useCardInfo = {};
                var ocCardIds = [];
                var ocUsedCards = [];
                var ocRuleResults = [];
                useCardInfo.couponsInfo = ocCardIds;
                ruleResults.forEach(function (ruleResult) {
                    if (ruleResult.cartKey != oc.cartKey) {
                        return;
                    }
                    if (ruleResult.usedAmount == 0) {
                        return;
                    }
                    ocRuleResults.push(ruleResult);
                    var usedCardBatches = ruleResult.usedCardBatches;
                    usedCardBatches.forEach(function (usedCardBatch) {
                        var batchUsedCards = [];
                        usedCardBatch.push(batchUsedCards);
                        allCardBatches.forEach(function (ownedCardBatch) {
                            if (usedCardBatch[0] == ownedCardBatch.id) {
                                for (var i = 0; i < ownedCardBatch.allCards.length; i++) {
                                    if (batchUsedCards.length == usedCardBatch[1]) {
                                        break;
                                    }
                                    var card = ownedCardBatch.allCards[i];
                                    if (_.indexOf(usedCardIs, card.cardNumber) == -1) {
                                        //还没有使用
                                        ocCardIds.push(card.cardId);
                                        ocUsedCards.push(card);
                                        batchUsedCards.push(card);
                                        totalUseCardAmount += Number(card.amountString);
                                        usedCardIs.push(card.cardNumber);
                                    }
                                }
                            }
                        });
                    });
                });
                //////////////////////////////////////////////////
                //用卡规则分摊完成
                oc.usedCards = ocUsedCards;
                oc.ocRuleResults = ocRuleResults;
                var cardTotalAmount = 0;
                //计算用了多少卡
                if (ocUsedCards) {
                    ocUsedCards.forEach(function (card) {
                        cardTotalAmount += Number(card.amount);
                    });
                    cardTotalAmount = toFixedEx(cardTotalAmount);
                }
                oc.cardTotalAmount = cardTotalAmount;
            });
        }

        //begin 下面又开始v3的内容，将crossMerchant的用卡规则分配到订单里
        ruleResults.forEach(function (ruleResult) {
            if (ruleResult.cartKey == 'crossMerchant') {
                var ruleUsedCards = [];
                var usedCardBatches = ruleResult.usedCardBatches;
                usedCardBatches.forEach(function (usedCardBatch) {
                    var batchUsedCards = [];
                    usedCardBatch.push(batchUsedCards);
                    allCardBatches.forEach(function (ownedCardBatch) {
                        if (usedCardBatch[0] == ownedCardBatch.id) {
                            for (var i = 0; i < ownedCardBatch.allCards.length; i++) {
                                if (batchUsedCards.length == usedCardBatch[1]) {
                                    break;
                                }
                                var card = ownedCardBatch.allCards[i];
                                if (_.indexOf(usedCardIs, card.cardNumber) == -1) {
                                    //还没有使用
                                    batchUsedCards.push(card);
                                    usedCardIs.push(card.cardId);
                                    ruleUsedCards.push(card);
                                }
                            }
                        }
                    });
                });
                for (var cartKey in ruleResult.ocPayPrices) {
                    for (var i = 0; i < ocs.length; i++) {
                        var oc = ocs[i];
                        if (oc.cartKey == cartKey) {
                            if (!oc.crossMerchantRuleResult) {
                                oc.crossMerchantRuleResult = [];
                            }
                            oc.crossMerchantRuleResult.push(ruleResult);
                            if (!oc.crossMerchantUsedCards) {
                                oc.crossMerchantUsedCards = []
                            }
                            var ocPayPrice = Number(ruleResult.ocPayPrices[cartKey]);
                            var totalPayPrice = Number(ruleResult.totalPayPrice);
                            var ratio = Number(toFixedEx(ocPayPrice / totalPayPrice));
                            var sharedCards = ruleUsedCards.map(function (card) {
                                return {cardId: card.cardId, ratio: ratio, amount: Number(toFixedEx(card.amount)) * ratio}
                            });
                            oc.crossRuleResult = oc.crossMerchantUsedCards.concat(ruleUsedCards);
                            var cardTotalAmount = 0;
                            sharedCards.forEach(function (card) {
                                cardTotalAmount += Number(card.amount);
                            });
                            cardTotalAmount = toFixedEx(cardTotalAmount);
                            oc.sharedCards = sharedCards;
                            setCrossOrderRuleResult(oc, ruleResult, sharedCards);

                            if (!oc.cardTotalAmount) {
                                oc.cardTotalAmount = 0;
                            }
                            oc.cardTotalAmount = Number(oc.cardTotalAmount) + Number(cardTotalAmount);
                        }
                    }
                }

            }
        });
        //end v3 跨商家用券

        /////////////////////
        //将积分支付分摊到各个订单
        var useIntegralMoney = $.params["payi_4"] || 0; //积分支付
        var finalPayAmount = 0;
        var maxFinalPayAmount = 0;
        var maxOc = null;
        ocs.forEach(function (oc) {
            finalPayAmount += (oc.finalPayAmount - oc.cardTotalAmount);
            if (maxFinalPayAmount < (oc.finalPayAmount - oc.cardTotalAmount)) {
                maxFinalPayAmount = (oc.finalPayAmount - oc.cardTotalAmount);
                maxOc = oc;
            }
            oc.effectivePayAmount = oc.finalPayAmount - oc.cardTotalAmount;
        });

        //分摊积分
        if (useIntegralMoney && useIntegralMoney != 0) {
            var delta = Number(useIntegralMoney);
            ocs.forEach(function (oc) {
                var share = Number(toFixedEx((oc.effectivePayAmount / finalPayAmount) * useIntegralMoney));
                delta = Number(toFixedEx(delta - share));
                oc.usePointAmount = share;
            });
            if (delta != 0) {
                //分摊到最大的那个
                maxOc.usePointAmount = Number(maxOc.usePointAmount) + delta;
            }
        }

        //------分摊预存款.....begin
        //将预存款分摊到各个订单
        //计算每个订单能用多少预存款支付
        var depositBalance = Number(AccountService.getUserBalance(buyerId, "head_merchant", "eWallet"));
        var depositAppliedColumnIds = [];
        var isEnableRule = false;//是否启用预存款使用规则，默认为false
        var totalCanUseDeposit = 0;
        var jArgs = PreDepositRuleSettingService.getArgs();
        if (!jArgs) {
            jArgs = {};
        }
        depositAppliedColumnIds = jArgs.columnIds;
        if (jArgs.isEnableRule && jArgs.isEnableRule == "1") {
            isEnableRule = true;
        }

        if (isEnableRule && depositAppliedColumnIds && depositAppliedColumnIds != "") {
            depositAppliedColumnIds = depositAppliedColumnIds.split(",");
            if (depositAppliedColumnIds.length > 0) {
                //当设置了预存款使用规则，则判断用户的预存款有效期
                var preDepositRuleBeginTime = 0;
                var preDepositRuleEndTime = 0;
                var serverTime = new Date().getTime();
                if (jUser.preDepositRuleBeginTime) {
                    preDepositRuleBeginTime = Number(jUser.preDepositRuleBeginTime);
                }
                if (jUser.preDepositRuleEndTime) {
                    preDepositRuleEndTime = Number(jUser.preDepositRuleEndTime);
                }

                if (!(preDepositRuleBeginTime < serverTime && serverTime < preDepositRuleEndTime)) {
                    //当不在有效期内则把可用预存款设置为0
                    depositBalance = "0";
                }
            }
        }

        function getCanUseDeposit(buyItem) {
            if (!isEnableRule) {
                return buyItem.totalDealPrice;
            }
            var columnIds = buyItem.columnIds;
            if (columnIds) {
                columnIds = columnIds.split(",");
                var canUseDeposit = false;
                for (var i = 0; i < columnIds.length; i++) {
                    if (depositAppliedColumnIds && depositAppliedColumnIds.indexOf(columnIds[i]) >= 0) {
                        canUseDeposit = true;
                    }
                }
                if (!canUseDeposit) {
                    return 0;
                }
                return buyItem.totalDealPrice;
            }
            return 0;
        }


        ocs.forEach(function (oc) {
            var ocTotalCanUseDeposit = 0;
            oc.buyItems.forEach(function (buyItem) {
                buyItem.canUseDeposit = getCanUseDeposit(buyItem);
                ocTotalCanUseDeposit += buyItem.canUseDeposit;
            });

            //运费可以用预存款支付
            ocTotalCanUseDeposit += oc.totalDeliveryFee;
            //减去券支付的部分
            if (oc.cardTotalAmount) {
                ocTotalCanUseDeposit -= Number(oc.cardTotalAmount);
            }
            //减去积分支付的部分
            if (oc.usePointAmount) {
                ocTotalCanUseDeposit -= Number(oc.usePointAmount);
            }

            oc.depositTotalAmount = Number(toFixedEx(ocTotalCanUseDeposit));
            totalCanUseDeposit += oc.depositTotalAmount;
        });

        var useDepositMoney = $.params["payi_5"] || 0; //预存款支付
        //分摊预存款(按oc的可用预存款金额来分摊)
        if (useDepositMoney && useDepositMoney != 0) {
            useDepositMoney = Number(useDepositMoney);
            totalCanUseDeposit = Number(toFixedEx(totalCanUseDeposit));
            if (totalCanUseDeposit < useDepositMoney) {
                throw "本订单最多只能用" + totalCanUseDeposit + "元预存款";
            }
            if (depositBalance < useDepositMoney) {
                throw "您的预存款余额不足。";
            }

            //var delta = Number(useDepositMoney);
            var totalOcUseDepositAmount = 0;
            var maxOc = null;
            ocs.forEach(function (oc) {
                var ocUseDepositMoney = Number(toFixedEx((oc.depositTotalAmount / totalCanUseDeposit) * useDepositMoney));
                if (maxOc == null) {
                    maxOc = oc;
                } else {
                    if (maxOc.depositTotalAmount < oc.depositTotalAmount) {
                        maxOc = oc;
                    }
                }

                oc.useDepositAmount = ocUseDepositMoney;
                totalOcUseDepositAmount += ocUseDepositMoney;
            });
            totalOcUseDepositAmount = toFixedEx(totalOcUseDepositAmount);
            var delta = Number(toFixedEx(useDepositMoney - totalOcUseDepositAmount));
            if (delta != 0) {
                //分摊到最大的那个
                maxOc.useDepositAmount += delta;
            }
        }
        //------分摊预存款.....end

        //如果积分与购物券支付金额大于商品金额
        var paidAmount = Number(totalUseCardAmount) + Number(useIntegralMoney);
        paidAmount = Number(toFixedEx(paidAmount));
        totalProductPrice = Number(toFixedEx(totalProductPrice));
        if (paidAmount > totalProductPrice) {
            var ret = {state: "err", msg: "积分与购物券支付金额(" + paidAmount + ")不能大于商品总金额(" + totalProductPrice + ")。"};
            out.print(JSON.stringify(ret));
            return;
        }
        //所有已支付金额大于订单总金额
        var totalPaidAmount = Number(totalUseCardAmount) + Number(useIntegralMoney) + Number(useDepositMoney);
        totalPaidAmount = Number(toFixedEx(totalPaidAmount));
        totalOrderPrice = Number(toFixedEx(totalOrderPrice));
        if (totalPaidAmount > totalOrderPrice) {
            var ret = {
                state: "err",
                msg: "已支付金额(" + toFixedEx(totalPaidAmount) + ")不能大于订单总金额(" + totalOrderPrice + ")。"
            };
            out.print(JSON.stringify(ret));
            return;
        }

        var orderAliasCodes = [];

        var promotionUserPhone = $.params.promotionUserPhone || "";//推广员手机号;
        var fastDeliveryStart = $.params.fastDeliveryStart;
        var fastDeliveryEnd = $.params.fastDeliveryEnd;
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
            if (oc.crossBorder) {
                order.certificate = idCard;
                order.deliveryInfo.identityType = "0";
                order.deliveryInfo.identityNumber = idCard;
            }
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
            //var usedCardIds = [];
            //if(oc.usedCards){
            //    $.log("\n..............2222222222222................usedCards0="+JSON.stringify(oc.usedCards));
            //    usedCardIds = oc.usedCards.map(function(card){return card.cardId});
            //}
            //if(oc.sharedCards){
            //    usedCardIds = usedCardIds.concat(oc.sharedCards.map(function(card){return card.cardId}));
            //}
            order.crossRuleResult = oc.crossRuleResult;
            // order.useCardInfo = {couponsInfo:usedCardIds};
            order.promotionUserPhone = promotionUserPhone;
            order.orderSource = orderSource;
            order.fastDeliveryTimeStart = fastDeliveryStart;
            order.fastDeliveryTimeEnd = fastDeliveryEnd;
            //将身份证号码保存到订单配送信息字段里，不是跨境的或者身份证号码为空的不保存
            if (certificate && oc.crossBorder) {
                order.deliveryInfo.identityType = "0";
                order.deliveryInfo.identityNumber = certificate;
                if (addressState == "1") {
                    //地址是审核通过的才设置，否则需要等待审核通过才同步设置
                    order.deliveryInfo.idCardFrontPic = idCardFrontPic;
                    order.deliveryInfo.idCardBackPic = idCardBackPic;
                }
                order.certificate = certificate;
            }
            //usedCardIds = oc.usedCards.map(function (card){
            //    var cardId = card.cardId;
            //    return cardId;
            //});
            //真正保存订单
            var orderId = "" + NormalBuyFlowService.addRealOrder(order, "common", buyerId);
            orderIds.push(orderId);

            //成功一个就删除一个购物车
            CartService.removeCheckedItems(oc.cartId);
        });
        //保存身份证号码到地址中
        if (certificate && defaultAddress) {
            if (saveCertificate == "true") {
                //加密
                defaultAddress.certificate = Md5Service.encString(certificate, "!@#$%^") + "";
                AddressService.saveAddress(buyerId, defaultAddress);
            }
            UserService.saveUserTradeInfo(buyerId, "saveCertificate", saveCertificate || false);
        }

        var orders = [];
        var prepayCardPayRecs = [];
        var prepayCardPayRecIds = [];
        orderIds.forEach(function (orderId) {
            var order = OrderService.getOrder(orderId);
            orderAliasCodes.push(order.aliasCode);
            if (order.payRecs) {
                for (k in order.payRecs) {
                    var payRec = order.payRecs[k];
                    if (payRec.payInterfaceId == "payi_10") {
                        prepayCardPayRecIds.push(orderId + "%" + payRec.payRecId);
                        prepayCardPayRecs.push(payRec);
                    }
                }
            }
            orders.push(order);
        });

        SessionService.removeSessionValue("orderUserId", request);
        var ret = {state: "ok", orderIds: orderIds.join(",")};

        //家居券支付
        var useJiaJuQuanMoney = $.params["payi_160"] || 0;
        if (useJiaJuQuanMoney && useJiaJuQuanMoney != 0) {
            ret.useJiaJuQuanMoney = useJiaJuQuanMoney;
        }

        out.print(JSON.stringify(ret));
    }
    catch (e) {
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
        }
        catch (ex) {
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
        var ret = {state: "err", msg: "" + msg};
        out.print(JSON.stringify(ret));
    }
})();

function toFixedEx(num) {
    var dec = 2;
    var r = +(Math.round(+(num.toString() + 'e' + dec)).toString() + 'e' + -dec);
    r = r + "";
    var dianIndex = r.indexOf(".");
    if (dianIndex > -1) {
        var decimals = r.substring(dianIndex);
        if (decimals.length == 2) {
            r += "0";
        }
    } else {
        r += ".00";
    }

    return r;
}

function setCrossOrderRuleResult(oc, ruleResult, sharedCards){
    var crossRuleResult = oc.crossRuleResult;
    if(!crossRuleResult){
        crossRuleResult = [];
    }

    var smallResult = {
        ruleType:ruleResult.ruleType,
        ruleId:ruleResult.ruleId,
        ruleVid:ruleResult.ruleVid,
        amount:ruleResult.amount,
        usedAmount:ruleResult.usedAmount,
        totalPayPrice:ruleResult.totalPayPrice,
        itemIds:ruleResult.itemIds,
        itemPayPrices:ruleResult.itemPayPrices      //每个商品行的成交总价
    };
    smallResult.sharedCards = sharedCards.map(function(card){return card.cardId});

    var usedAmount = ruleResult.usedAmount;
    var totalPayPrice = ruleResult.totalPayPrice;
    var itemCardPayPrices = {};
    for (var itemId in smallResult.itemPayPrices) {
        var payPrice = smallResult.itemPayPrices[itemId];

        itemCardPayPrices[itemId] = toFixedEx(Number(toFixedEx(Number(payPrice)/Number(totalPayPrice))) * usedAmount);
    }
    smallResult.itemCardPayPrices = itemCardPayPrices;  ////每个商品行的分摊的用券金额

    crossRuleResult.push(smallResult);
    oc.crossRuleResult = crossRuleResult;
}
