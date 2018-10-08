//#import product.js
var OrderUtil = {

    checkProductType: function (oc) {
        var ret = {state: 'err'};
        if (!oc) {
            ret.msg = "oc不能为空";
            return ret;
        }
        var buyItems = oc.buyItems;
        if (!buyItems || buyItems.length == 0) {
            ret.msg = "商品不能为空";
            return ret;
        }
        var temperatureControl = "";
        for (var i = 0; i < buyItems.length; i++) {
            var buyItem = buyItems[i];
            var productId = buyItem.productId;
            var jProduct = ProductService.getProduct(productId);
            if (!jProduct) {
                ret.msg = productId + ",找不到对应的商品";
                return ret;
            }
            if (!temperatureControl) {
                temperatureControl = jProduct.temperatureControl;
            } else {
                if (temperatureControl != jProduct.temperatureControl) {
                    ret.msg = "不同类型商品不能一起结算";
                    return ret;
                }
            }
        }
        ret.state = "ok";
        ret.temperatureControl = temperatureControl;
        ret.msg = "检查成功";
        return ret;
    },
    distributeIntegral: function (ocs, useIntegralMoney) {
        if (!ocs || !useIntegralMoney) {
            return;
        }
        /////////////////////
        //将积分支付分摊到各个订单
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
        //积分分摊完成
    },
    //校验订单券规则
    checkOrderCardRule:function(allCardRules,selectedCardBatchAmounts){
        var ret = {state: '1'};
        $.log("------check order utils------");
        var batchAmounts = JSON.parse(selectedCardBatchAmounts);
        $.log("------check order utils6------");
        var ruleAmounts = allCardRules;
        $.log("------check order ruleAmounts="+ruleAmounts.length);

        $.log("------check order batchAmounts="+batchAmounts.length);
        //校验所选券批次是否都存在于可用券批次规则中
        var ruleInfoes = [];
        for(var n=0;n<batchAmounts.length;n++){
            var selectedCardBatch = batchAmounts[n];
            var selCardFlag = false;
            var selCardBatchId = selectedCardBatch.cardBatchId;
            ruleAmounts.forEach(function (ruleAmount) {
                var ruleCardBatches = ruleAmount.availableBatches;
                ruleCardBatches.forEach(function (ruleCardBatch) {
                    var ruleCardBatchId = ruleCardBatch.id;
                    if(ruleCardBatchId == selCardBatchId){
                        selCardFlag = true;
                        var ruleInfoObj = {};
                        ruleInfoObj.ruleId = ruleAmount.ruleId;
                        ruleInfoObj.excludeOtherOrderRule = ruleAmount.excludeOtherOrderRule;
                        ruleInfoObj.overaddOtherOrderRule = ruleAmount.overaddOtherOrderRule;
                        ruleInfoes.push(ruleInfoObj);
                    }
                });
            });
            if(!selCardFlag){
                ret.msg = "存在非法券批次"+selCardBatchId;
                return ret;
            }
        }
        if(!ruleInfoes || ruleInfoes.length == 0){
            ret.msg = "不存在合法的券批次";
            return ret;
        }
        $.log("------check order ruleInfoes="+JSON.stringify(ruleInfoes));
        for(var i=0;i<ruleInfoes.length;i++){
            var ruleInfo = ruleInfoes[i];
            var eoOrderRule = ruleInfo.excludeOtherOrderRule;
            var oaOtherOrderRule = ruleInfo.overaddOtherOrderRule;
            var outerRuleId = ruleInfo.ruleId;
            $.log("------check order eoOrderRule="+eoOrderRule);
            //如果不互斥
            if(eoOrderRule == "0"){
                $.log("------check order oaOtherOrderRule="+oaOtherOrderRule);
                //并且不叠加，则所选券批次对应的ruleId为唯一
                if(oaOtherOrderRule == "0"){
                    for(var j=0;j<ruleInfoes.length;j++){
                        var ruleInfo1 = ruleInfoes[j];
                        var innerRuleId = ruleInfo1.ruleId;
                        var innerOrderRule = ruleInfo1.excludeOtherOrderRule;
                        //如果存在不相等且订单规则不互斥，则说明ruleId不唯一
                        if(innerRuleId != outerRuleId && innerOrderRule == "0"){
                            ret.msg = "不可叠加规则中存在叠加规则";
                            return ret;
                        }
                    }
                }else{
                    //如果可叠加，则所有的券规则都可叠加
                    for(var k=0;k<ruleInfoes.length;k++){
                        var ruleInfo2 = ruleInfoes[k];
                        var oaOtherOrderRule2 = ruleInfo2.overaddOtherOrderRule;
                        var innerOrderRule2 = ruleInfo2.excludeOtherOrderRule;
                        $.log("------check order oaOtherOrderRule2="+oaOtherOrderRule2);
                        $.log("------check order innerOrderRule2="+innerOrderRule2);
                        //如果可叠加规则中存在不可叠加券规则，且该规则为不互斥
                        if(oaOtherOrderRule2 == "0" && innerOrderRule2 == "0"){
                            ret.msg = "可叠加规则中存在不可叠加规则";
                            return ret;
                        }
                    }
                }
            }
        }
        $.log("------check order utils5------");
        ret.state = "0";
        ret.msg = "检查成功";
        return ret;
    },
    distributeCoupon: function (ocs, selectedCardBatchAmounts, allCardBatches) {
        if (!ocs || ocs.length == 0 || !selectedCardBatchAmounts || selectedCardBatchAmounts.length == 0
            || !allCardBatches || allCardBatches.length == 0) {
            return 0;
        }
        var batchAmounts = JSON.parse(selectedCardBatchAmounts);
        batchAmounts.forEach(function (selectedCardBatch) {
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
        return totalUseCardAmount;
    },
    distributePrepayCard: function (ocs, prepayCards) {
        if (!ocs || ocs.length == 0 || !prepayCards || prepayCards.length == 0) {
            return 0;
        }
        var prepayCardsTotalAmount = 0;
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
        return prepayCardsTotalAmount;
    }

};