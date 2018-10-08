

function UseCardRule(data) {
    var self = this;
    self.type = data.type;//"item"; //item or order
    self.ruleId = data.ruleId; //"";
    self.availableBatches = data.availableBatches;
    self.amount = data.amount;
    self.oc = data.oc;
}
function PluginItemUseTicket() {
    var self = this;
    $.extend(self, new PluginItem());
    self.orderForm = ko.observable();
    self.availableRules = ko.observableArray([]);
    self.maxAvailableCardBatches = ko.observableArray([]);


    self.onInit = function (orderForm) {
        self.orderForm(orderForm);
        //self.availableRules(self.getAvailableCardRules());
        //self.maxAvailableCardBatches(self.getMaxAvailableCardBatches());
        //self.distributeCards();
        //self.getSelectableNumbers();
    };

    self.onUpdate = function (rawData) {
        self.availableRules(self.getAvailableCardRules());
        self.maxAvailableCardBatches(self.getMaxAvailableCardBatches());
        self.getSelectableNumbers();
    };
    self.onOrderFormChanged = function(orderForm){
        self.orderForm(orderForm);
        self.getSelectableNumbers();
    }

    self.selectedCardBatches = ko.observableArray();
    self.hasAvailableCards = ko.computed(function () {
        return self.maxAvailableCardBatches() && self.maxAvailableCardBatches().length > 0;
    });

    self.noAvailableCards = ko.computed(function () {
        return !self.hasAvailableCards();
    });

    self.getAvailableCardRules = function () {
        var allCardRules = [];
        if (!self.orderForm()) {
            return [];
        }
        var crossOrderRuleResults = self.orderForm().crossOrderRuleResults();
        $.each(self.orderForm().ocs(), function (idx, oc) {
            if (oc.availableRuleResults) {
                $.each(oc.availableRuleResults, function (idx, ruleResult) {
                    if(ruleResult.type!="OUC"){
                        return;
                    }

                    _.each(ruleResult.availableCardRules,function(cardRule){
                        if(cardRule.recommend){
                            return;
                        }
                        var rule = new UseCardRule({
                            type: ruleResult.type,
                            ruleId: ruleResult.ruleId,
                            availableBatches: cardRule.availableBatches,
                            amount: cardRule.amount,
                            oc:oc
                        });
                        allCardRules.push(rule);
                    });

                });
            }
            $.each(oc.buyItems(),function(idx1,item){
                if(item.availableRuleResults){
                    $.each(item.availableRuleResults, function (idx2, ruleResult) {
                        if(ruleResult.type!="puc"){
                            return;
                        }
                        _.each(ruleResult.availableCardRules,function(cardRule){
                            if(cardRule.recommend){
                                return;
                            }
                            var rule = new UseCardRule({
                                type: ruleResult.type,
                                ruleId: ruleResult.ruleId,
                                availableBatches: cardRule.availableBatches,
                                amount: cardRule.amount,
                                oc:oc
                            });
                            allCardRules.push(rule);
                        });
                    });
                }
            });
        });

        if (crossOrderRuleResults) {
            $.each(crossOrderRuleResults, function (idx, ruleResult) {
                if(ruleResult.type!="OUC"){
                    return;
                }
                _.each(ruleResult.availableCardRules,function(cardRule){
                    if(cardRule.recommend){
                        return;
                    }
                    var rule = new UseCardRule({
                        type: ruleResult.type,
                        ruleId: ruleResult.ruleId,
                        availableBatches: cardRule.availableBatches,
                        amount: cardRule.amount
                    });
                    allCardRules.push(rule);
                });

            });
        }


        console.log("allCardRules", allCardRules);
        return allCardRules;
    };

    self.getMaxAvailableCardBatches = function(){
        //1.获得所有的cardBatches
        var allCardBatches = self.orderForm().ocs()[0].allCardBatches;
        var crossOrderRuleResults = self.orderForm().crossOrderRuleResults();
        console.log("allCardBatches1", allCardBatches);
        $.each(self.orderForm().ocs(),function(idx,oc){
            var batches = oc.allCardBatches;
            if(batches && batches.length>0){
                allCardBatches = batches;
            }
        });
        $.each(crossOrderRuleResults, function (idx, ruleResult) {
            if(ruleResult.type!="OUC"){
                return;
            }

            _.each(ruleResult.availableCardRules,function(cardRule){
                if(cardRule.recommend){
                    return;
                }
                var availableBatches = cardRule.availableBatches;
                if(availableBatches){
                    for(var i =0;i<availableBatches.length;i++){

                        allCardBatches.push(availableBatches[i]);
                    }
                }

            });

        });
        console.log("allCardBatches2", allCardBatches);
        var effectiveBatches = [];
        //2.计算每个cardBatch如果其他卡都不选，只选本cardBatches的时候能有多少张卡可以使用
        $.each(allCardBatches,function(idx,batch){
            var effectiveBatch = {
                id:batch.id,
                name:batch.name,
                faceValue:batch.faceValue,
                maxAmount : 0,
                checked : ko.observable(false),
                selectedNumber : ko.observable(0),
                selectableNumber : ko.observable(0),
                disabled:ko.observable(false),
                begin:batch.effectedBeginString,
                end:batch.effectedEndString,
                options : ko.observableArray(),
                allCardsNumber:batch.allCards.length
            };
            $.each(self.availableRules(),function(idx1,rule){
                //看看这个batch能满足多少amount
                var found = false;
                $.each(rule.availableBatches,function(idx2,availableBatch){
                    if(batch.id == availableBatch.id){
                        found = true;
                    }
                });
                if(found){
                    effectiveBatch.maxAmount+=rule.amount;
                }
            });
            if(effectiveBatch.maxAmount > effectiveBatch.faceValue * effectiveBatch.allCardsNumber){
                effectiveBatch.maxAmount = effectiveBatch.faceValue * effectiveBatch.allCardsNumber;
            }
            self.selectingNumbers = true; //为了防止在getSelectableNumbers中修改selectedNumber引起死循环


            effectiveBatch.checked.subscribe(function(newValue){
                if(!self.selectingNumbers) {
                    self.getSelectableNumbers();
                    self.confirm();
                }
            });
            effectiveBatch.selectedNumber.subscribe(function(newValue){
                if(!self.selectingNumbers){
                    _.defer(function(){
                        self.getSelectableNumbers();
                        self.confirm();
                    });
                }
            });
            self.selectingNumbers = false;
            effectiveBatches.push(effectiveBatch);
        });
        console.log("effectiveBatches", effectiveBatches);
        return effectiveBatches;
    };

    self.getPaidMoneyByThisPlugin = function(oc){
        return oc.usedTicketAmount;
    };

    self.distributeCards = function(excludeBatchId){
        $.each(self.availableRules(),function(i,rule){
            rule.usedAmount = 0;
        });
        //首先计算每个Oc除了用券支付以外的剩下的需要支付的金额
        $.each(self.orderForm().ocs(),function(i,oc){
            if(!oc){
                return;
            }
            oc.tempNeedPaid = oc.finalPayAmount()-AppConfig.leftCashPayAmount; //保留一块钱，每次支付最少用1块钱。这样可以打出发票
            for (var k in self.orderForm().pluginItems) {
                var plugin = self.orderForm().pluginItems[k];
                if(plugin instanceof PluginItemUseTicket){
                    continue;
                }
                oc.tempNeedPaid -= plugin.getPaidMoneyByThisPlugin(oc);
            }
            //由于积分和购物券不能用于支付运费，所以这里要判断能用积分支付的金额不能大于 商品金额 - 用券金额
            var productPrice = oc.totalOrderProductPrice() - (oc.usedIntegralAmount || 0);
            if(productPrice < oc.tempNeedPaid){
                oc.tempNeedPaid = productPrice;
            }
        });
        //计算当排除了excludeBatchId后，的一种分法
        //是将卡分摊到卡规则，而不是将卡分摊到oc，不过由于卡规则是属于某各oc的，所以我们将卡规则累加就可以了。
        $.each(self.maxAvailableCardBatches(),function(idx,batch){
            if(batch.id==excludeBatchId){
                return;
            }
            if(!batch.checked()){
                return;
            }
            var secondRound = [];
            var leftAmount = batch.selectedNumber() * batch.faceValue;//开始分摊某批次的卡，还剩下多少钱没有分摊
            $.each(self.availableRules(),function(idx1,rule){
                if(leftAmount==0 || !rule.oc){
                    return;
                }
                var found = _.findWhere(rule.availableBatches,{id:batch.id});
                if(!found){
                    return;
                }
                found = _.findWhere(rule.availableBatches,{id:excludeBatchId});
                if(found){
                    secondRound.push(rule);
                    return;
                }
                var useAmount = leftAmount;
                if(rule.amount-rule.usedAmount<useAmount){
                    useAmount = rule.amount - rule.usedAmount;
                }

                //能用多少钱还要看这个oc还有多少钱需要支付
                if(rule.oc.tempNeedPaid < useAmount){
                    useAmount = rule.oc.tempNeedPaid;
                }


                useAmount = Math.floor(useAmount/batch.faceValue+0.00001) * batch.faceValue;
                rule.oc.tempNeedPaid-=useAmount;
                rule.usedAmount += useAmount;
                leftAmount -= useAmount;

            });
            if(leftAmount > 0){
                secondRound = _.sortBy(secondRound,function(rule){return rule.availableBatches.length;});
                $.each(secondRound,function(idx1,rule){
                    if(leftAmount==0 || !rule.oc){
                        return ;
                    }
                    var useAmount = leftAmount;
                    if(rule.amount-rule.usedAmount<useAmount){
                        useAmount = rule.amount - rule.usedAmount;
                    }
                    //能用多少钱还要看这个oc还有多少钱需要支付
                    if(rule.oc.tempNeedPaid < useAmount){
                        useAmount = rule.oc.tempNeedPaid;
                    }
                    useAmount = Math.floor(useAmount/batch.faceValue+0.0001) * batch.faceValue;
                    rule.usedAmount += useAmount;
                    rule.oc.tempNeedPaid-=useAmount;
                    leftAmount -= useAmount;
                });
            }

            //跨商家用券计算....begin
            if(leftAmount > 0){
                var totalLeftCrossAmount = 0;
                $.each(self.orderForm().ocs(),function(i,oc){
                    if(!oc){
                        return;
                    }
                    totalLeftCrossAmount += oc.tempNeedPaid;
                });

                if(totalLeftCrossAmount < leftAmount){
                    leftAmount = totalLeftCrossAmount;
                }

                var crossSecondRound = [];
                $.each(self.availableRules(),function(idx1,rule){
                    if(rule.oc){
                        //有oc的就不是跨商家用券了
                        return;
                    }
                    var found = _.findWhere(rule.availableBatches,{id:batch.id});
                    if(!found){
                        return;
                    }
                    found = _.findWhere(rule.availableBatches,{id:excludeBatchId});
                    if(found){
                        crossSecondRound.push(rule);
                        return;
                    }
                    var useAmount = leftAmount;
                    if(rule.amount-rule.usedAmount<useAmount){
                        useAmount = rule.amount - rule.usedAmount;
                    }
                    //
                    ////能用多少钱还要看这个oc还有多少钱需要支付
                    //if(rule.oc.tempNeedPaid < useAmount){
                    //    useAmount = rule.oc.tempNeedPaid;
                    //}
                    useAmount = Math.floor(useAmount/batch.faceValue+0.00001) * batch.faceValue;
                    //rule.oc.tempNeedPaid-=useAmount;
                    rule.usedAmount += useAmount;
                    leftAmount -= useAmount;

                });
            }
            if(leftAmount > 0){
                crossSecondRound = _.sortBy(crossSecondRound,function(rule){return rule.availableBatches.length;});
                $.each(crossSecondRound,function(idx1,rule){
                    if(rule.oc) {
                        return ;
                    }
                    var useAmount = leftAmount;
                    if(rule.amount-rule.usedAmount<useAmount){
                        useAmount = rule.amount - rule.usedAmount;
                    }
                    ////能用多少钱还要看这个oc还有多少钱需要支付
                    //if(rule.oc.tempNeedPaid < useAmount){
                    //    useAmount = rule.oc.tempNeedPaid;
                    //}
                    useAmount = Math.floor(useAmount/batch.faceValue+0.0001) * batch.faceValue;
                    rule.usedAmount += useAmount;
                    //rule.oc.tempNeedPaid-=useAmount;
                    leftAmount -= useAmount;
                });
            }
            //跨商家用券计算....end


            if(leftAmount - 0.0001 > 0){
                batch.number = Math.ceil(leftAmount / batch.faceValue-0.0001);
            }
        });
    }
    self.getSelectableNumber = function(batchId,faceValue){
        self.distributeCards(batchId);
        var totalNumber = 0;
        _.each(self.availableRules(),function(rule){
            var found = _.findWhere(rule.availableBatches,{id:batchId});
            if(found){
                if(!rule.oc){
                    return ;
                }
                //这个rule对这个batch的贡献
                var leftAmount = (rule.amount - rule.usedAmount);
                if(rule.oc.tempNeedPaid < leftAmount){
                    leftAmount = rule.oc.tempNeedPaid;
                }
                var ruleNumber = Math.floor(leftAmount / faceValue+0.0001);
                totalNumber += ruleNumber;
                rule.oc.tempNeedPaid -= ruleNumber * faceValue;
            }

        });

        //跨商家用券计算....begin
        var totalLeftCrossAmount = 0;
        $.each(self.orderForm().ocs(),function(i,oc){
            if(!oc){
                return;
            }
            totalLeftCrossAmount += oc.tempNeedPaid;
        });
        if(totalLeftCrossAmount < 0){
            totalLeftCrossAmount = 0;
        }
        console.log("totalLeftCrossAmount=" + totalLeftCrossAmount);
        _.each(self.availableRules(),function(rule){
            var found = _.findWhere(rule.availableBatches,{id:batchId});
            if(found){
                if(rule.oc){
                    return ;
                }
                //这个rule对这个batch的贡献
                var leftAmount = (rule.amount - rule.usedAmount);
                if(totalLeftCrossAmount < leftAmount){
                    leftAmount = totalLeftCrossAmount;
                }
                var ruleNumber = Math.floor(leftAmount / faceValue+0.0001);
                totalNumber += ruleNumber;
                //rule.oc.tempNeedPaid -= ruleNumber * faceValue;
            }
        });
        //跨商家用券计算....end
        //totalNumber 不能大于用户拥有的卡数量
        return totalNumber;
    }
    //考虑了用户已经选择的卡后，计算每各批次还能选择多少张卡
    self.getSelectableNumbers= function(){
        if(self.selectingNumbers){
            return;
        }
        self.selectingNumbers = true;
        var effectiveBatches = self.maxAvailableCardBatches();
        $.each(effectiveBatches,function(dumy,batch){
            batch.disabled(false);
            var maxNumber = self.getSelectableNumber(batch.id,batch.faceValue);
            if(maxNumber > 0){
                if(maxNumber>batch.allCardsNumber){
                    maxNumber = batch.allCardsNumber;
                }
                batch.selectableNumber(maxNumber);
                batch.options (_.range(1,maxNumber+1));
                var checked = batch.checked();
                if(!checked){
                    batch.selectedNumber(1);
                }
            }
            else{
                batch.selectedNumber(Math.floor(batch.maxAmount / batch.faceValue+0.001));
                batch.checked(false);
                batch.disabled(true);
            }

        });
        self.selectingNumbers = false;
    }

    self.getTotalUsedMoney = function(){
        var sum = 0;
        _.each(self.maxAvailableCardBatches(),function(batch){
            if(batch.checked()){
                sum += batch.selectedNumber() * batch.faceValue;
            }
        });
        return sum;
    }

    self.getTotalUsedNumber = function(){
        var sum = 0;
        _.each(self.maxAvailableCardBatches(),function(batch){
            if(batch.checked()){
                sum += batch.selectedNumber();
            }
        });
        return sum;
    }

    self.onAddOrder = function () {
        var selectedCardBatchAmount = [];
        $.each(self.maxAvailableCardBatches(), function (idx, cardBatch) {
            if(cardBatch.checked()){
                selectedCardBatchAmount.push({
                    cardBatchId: cardBatch.id,
                    selectedNumber: cardBatch.selectedNumber()
                });
            }

        });
        console.log("selectedCardBatchAmount=",selectedCardBatchAmount);
        return {
            selectedCardBatchAmounts: JSON.stringify(selectedCardBatchAmount)
        }
    }


    self.totalUsedMoney = ko.observable(0);
    self.totalUsedNumber = ko.observable(0); //使用的券的张数

    self.confirm = function () {
        var sum = (self.getTotalUsedMoney()+0.0001).toFixed(2);
        self.totalUsedMoney(sum);
        self.totalUsedNumber((self.getTotalUsedNumber()+0.0001).toFixed(0));
        //计算每个oc已经使用的券
        $.each(self.orderForm().ocs(), function (idx, oc) {
            oc.usedTicketAmount = 0;
        });
        self.distributeCards("excludeNone");//用一个肯定不会命中的cardId,保证不会被排除，实现所有卡批次都分配到rule
        $.each(self.availableRules(),function(i,rule){
            if(rule.oc){
                rule.oc.usedTicketAmount+=Number(rule.usedAmount);
            }
        });


        self.orderForm().updatePayRec({payInterfaceId: "payi_2", name: "用券支付", money: sum});
    }

    self.close = function(){
        self.detailVisible(false);
    }
}