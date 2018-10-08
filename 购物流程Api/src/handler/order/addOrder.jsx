//#import Util.js
//#import product.js
//#import order.js
//#import login.js
//#import normalBuy.js
//#import cart.js
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
//#import column.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx
//#import $resellerCommission:services/resellerCommissionService.jsx
;
(function () {
    var ArrayList = java.util.ArrayList;
    var merchantId = $.params.merchantId;//结算商家
    var exMerchantId = $.params.exm;//不包含结算商家
    var saveCertificate = $.params.saveCertificate;//是否保存身份证信息
    var certificate = $.params.certificate || ""; //身份证件，用于跨境电商
    var isGift = $.params.isGift;
    var giftRegionId = $.params.giftRegionId;
    if (isGift) {
        isGift = true;
    }
    else {
        isGift = false;
    }
    var orderIds = [];
    try {
        var orderSource = $.params.source || "front";
        var orderSignMode = $.params.orderSignMode || "";
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
        var prepayCards = $.params.prepayCards;
        if (prepayCards) {
            prepayCards = JSON.parse(prepayCards);
        }
        if (prepayCards && prepayCards.length == 0) {
            prepayCards = null;
        }
        var cartIds = $.params.cartIds;
        var description = $.params.memo;
        var buyingDevice = $.params.buyingDevice;
        var selectedPaymentId = $.params.selectedPaymentId;
        var selectedPayInterfaceId = $.params.selectedPayInterfaceId;
        var selectedOcPayments = $.params.selectedOcPayments;//每个OC选择的payInterfaceId
        if (selectedOcPayments) {
            selectedOcPayments = JSON.parse(selectedOcPayments);
        }
        if (!selectedPayInterfaceId) {
            selectedPayInterfaceId = UserProfileService.getUserInfo(buyerId, "selectedPayInterfaceId");
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

        var serverTime = new Date().getTime();
        var jUser = UserService.getUser(buyerId);

        $.log("------2.selectedPayInterfaceId----" + selectedPayInterfaceId + "\n");
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
            if(orderSignMode == "other"){
                if(description && description != ""){
                    description = "业主同意托管钥匙给物业，由物业负责帮忙签收商品，" + description;
                } else {
                    description = "业主同意托管钥匙给物业，由物业负责帮忙签收商品";
                }
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
            totalProductPrice += (oc.finalPayAmount - oc.totalDeliveryFee);
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

            var ruleResults = NormalBuyFlowService.distributeCards(ocs, batchAmounts);
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
                    cardTotalAmount = (cardTotalAmount + 0.0001).toFixed(2);
                }
                oc.cardTotalAmount = cardTotalAmount;
            });
        }


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
                var share = ((oc.effectivePayAmount / finalPayAmount) * useIntegralMoney).toFixed(2);
                delta = Number((delta - share).toFixed(2));
                oc.usePointAmount = share;
            });
            if (delta != 0) {
                //分摊到最大的那个
                maxOc.usePointAmount = Number(maxOc.usePointAmount) + delta;
            }
        }
        //将预存款分摊到各个订单
        //计算每个订单能用多少预存款支付
        var depositBalance =  Number(AccountService.getUserBalance(buyerId, "head_merchant", "eWallet"));
        var depositAppliedColumnIds = [];
        var totalCanUseDeposit = 0;
        if(typeof PreDepositRuleSettingService != 'undefined'){
            var jArgs = PreDepositRuleSettingService.getArgs();
            if (!jArgs) {
                jArgs = {};
            }
            depositAppliedColumnIds = jArgs.columnIds;

            if (depositAppliedColumnIds && depositAppliedColumnIds != "") {
                depositAppliedColumnIds = depositAppliedColumnIds.split(",");
                if (depositAppliedColumnIds.length > 0) {
                    //当设置了预存款使用规则，则判断用户的预存款有效期
                    var preDepositRuleBeginTime = 0;
                    var preDepositRuleEndTime = 0;
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
        }


        function getCanUseDeposit(buyItem){
            if(typeof PreDepositRuleSettingService == 'undefined'){
                //没有配置是否可用预存款的情况下,默认可以用
                return buyItem.totalPayPrice;
            }
            var columnIds = buyItem.columnIds;
            if(columnIds){
                columnIds = columnIds.split(",");
                var canUseDeposit = false;
                for(var i=0;i<columnIds.length;i++){
                    if(depositAppliedColumnIds && depositAppliedColumnIds.indexOf(columnIds[i])>=0){
                        canUseDeposit = true;
                    }
                }
                if(!canUseDeposit){
                    return 0;
                }
                return buyItem.totalPayPrice;
            }
            return 0;
        }

        ocs.forEach(function(oc){
            oc.buyItems.forEach(function(buyItem){
                buyItem.canUseDeposit = getCanUseDeposit(buyItem);
                totalCanUseDeposit += buyItem.canUseDeposit;
            });

            //运费可以用预存款支付
            totalCanUseDeposit += oc.totalDeliveryFee;
        });

        var useDepositMoney = $.params["useDeposit"] || $.params["payi_5"] || 0; //预存款支付
        //计算可以用的
        //分摊预存款
        if (useDepositMoney && useDepositMoney != 0) {
            if(totalCanUseDeposit<useDepositMoney){
                throw "本订单最多只能用"+totalCanUseDeposit + "元预存款";
            }
            if(depositBalance<useDepositMoney){
                throw "您的预存款余额不足。";
            }
            var delta = Number(useDepositMoney);
            var maxItem = null;
            var maxOc = null;
            ocs.forEach(function (oc) {
                var ocUseDepositMoney = 0;
                //直接分摊到每个buyItem
                oc.buyItems.forEach(function(buyItem){
                    var share = ((buyItem.canUseDeposit/totalCanUseDeposit)*useDepositMoney).toFixed(2);
                    if(maxItem==null){
                        maxItem = buyItem;
                        maxOc = oc;
                    }
                    else{
                        if(maxItem.canUseDeposit < buyItem.canUseDeposit){
                            maxItem = buyItem;
                            maxOc = oc;
                        }
                    }
                    buyItem.useDepositAmount = share;
                    ocUseDepositMoney += Number(share);
                    delta = Number((delta - share).toFixed(2));
                });
                oc.useDepositAmount = ocUseDepositMoney;
            });
            if (delta != 0) {
                //分摊到最大的那个
                maxItem.useDepositAmount += delta;
                maxOc.useDepositAmount += delta;
            }
        }

        var prepayCardsTotalAmount = 0;
        //分摊预付卡
        if (prepayCards) {
            //1.首先对预付卡排序,再对oc排序
            prepayCards.forEach(function (card) {
                prepayCardsTotalAmount += Number(card.useAmount);
            });
            prepayCardsTotalAmount = Number(prepayCardsTotalAmount.toFixed(2));

            prepayCards.sort(function (a, b) {
                return a.useAmount - b.useAmount
            });

            var prepayCardOcs = [];
            ocs.forEach(function (oc) {
                if (oc.supportStoreCard) {
                    prepayCardOcs.push(oc);
                }
            });

            if (!prepayCardOcs || prepayCardOcs.length == 0) {
                throw "没有商家支持储值卡支付!";
            }

            prepayCardOcs.sort(function (a, b) {
                return a.effectivePayAmount - b.effectivePayAmount;
            });

            var orderAmounts = prepayCardOcs.map(function (oc) {
                return oc.effectivePayAmount;
            });
            var cardAmounts = prepayCards.map(function (card) {
                return card.useAmount;
            });
            var cardResults = OrderDistributeUtil.distribute(orderAmounts, cardAmounts);

            for (var j = 0; j < prepayCardOcs.length; j++) {
                var oc = prepayCardOcs[j];
                var usedCards = [];
                for (var i = 0; i < cardResults[j].length; i++) {
                    var card = {};
                    var usedAmount = cardResults[j][i];
                    card.cardNumber = prepayCards[i].cardNo;
                    card.cardId = prepayCards[i].cardNo;
                    card.usedAmount = usedAmount;
                    card.usedAmountString = "" + card.usedAmount;
                    usedCards.push(card);
                }
                oc.usedStoredCards = usedCards;
            }

            var ret = {
                orderAmounts: orderAmounts,
                cardAmounts: cardAmounts,
                distribute: cardResults
            };
            //return;
        }
        //如果积分与购物券支付金额大于商品金额
        var paidAmount = Number(totalUseCardAmount) + Number(useIntegralMoney);
        paidAmount = Number(paidAmount.toFixed(2));
        totalProductPrice = Number(totalProductPrice.toFixed(2));
        if (paidAmount > totalProductPrice) {
            var ret = {state: "err", msg: "积分与购物券支付金额(" + paidAmount + ")不能大于商品总金额(" + totalProductPrice + ")。"};
            out.print(JSON.stringify(ret));
            return;
        }
        //所有已支付金额大于订单总金额
        var totalPaidAmount = Number(totalUseCardAmount) + Number(useIntegralMoney) + Number(useDepositMoney) + Number(prepayCardsTotalAmount);
        totalPaidAmount = Number(totalPaidAmount.toFixed(2));
        totalOrderPrice = Number(totalOrderPrice.toFixed(2));
        if (totalPaidAmount > totalOrderPrice) {
            var ret = {
                state: "err",
                msg: "已支付金额(" + totalPaidAmount.toFixed(2) + ")不能大于订单总金额(" + totalOrderPrice + ")。"
            };
            out.print(JSON.stringify(ret));
            return;
        }

        if (prepayCards) {
            var payToPlatformPayments = PaymentService.getMerchantAllPaymentsByOrderType("head_merchant", "common");
            var effectivePaymentId = null;
            var effectivePaymentName = "预付卡支付";
            payToPlatformPayments.forEach(function (payment) {
                if (payment.objectMap.payInterfaceId == "payi_10") {
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
                payInterfaceId: "payi_10",
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
            order.promotionUserPhone = promotionUserPhone;
            order.certificate = certificate;
            order.orderSource = orderSource;
            order.orderSignMode = orderSignMode;
            order.fastDeliveryTimeStart = fastDeliveryStart;
            order.fastDeliveryTimeEnd = fastDeliveryEnd;
            //真正保存订单
            var orderId = "" + NormalBuyFlowService.addRealOrder(order, "common", buyerId);
            orderIds.push(orderId);

            //成功一个就删除一个购物车
            CartService.removeCheckedItems(oc.cartId);
        });
        //保存身份证号码到地址中
        if (certificate && defaultAddress && saveCertificate == "true") {
            //加密
            defaultAddress.certificate = Md5Service.encString(certificate, "!@#$%^") + "";
            AddressService.saveAddress(buyerId, defaultAddress);
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

        //调用预付卡支付接口
        if (prepayCards && prepayCards.length > 0) {
            var payResult = StoreCardService.useStoredCardPay(prepayCards, "head_merchant", "", realPayRecId, $.getClientIp(), "下单支付");
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
            }
            else {//支付失败
                var ret = {state: "err", msg: "预付卡支付失败。" + (payResult.msg || "")};
                out.print(JSON.stringify(ret));
                return;
            }
        }
    
        SessionService.removeSessionValue("orderUserId", request);
        var resellerId = SessionService.getSessionValue("resellerId",request);
        if(resellerId){
            if(typeof ResellerCommissionService != 'undefined'){
                ResellerCommissionService.setTemporaryParentReseller(buyerId,resellerId);
            }
        }


        var ret = {state: "ok", orderIds: orderIds.join(",")};

        //家居券支付
        var useJiaJuQuan = $.params["useJiaJuQuan"] || $.params["payi_160"] || 0;
        if(useJiaJuQuan && useJiaJuQuan != 0){
            ret.useJiaJuQuan = useJiaJuQuan;
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
            msg = ex.toString();
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