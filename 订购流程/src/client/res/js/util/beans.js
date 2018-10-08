/**
 * Created by Administrator on 2014/6/20.
 */
function RuleResult(data) {
    var self = this;
    self.id = data.id;
    self.ruleId = data.ruleId;
    self.ruleName = data.ruleName;
    self.recommendString = data.recommendString();

    self.excludedRuleIds = data.excludedRuleIds;
    self.name = data.name;
    self.userFriendlyMessages = ko.observableArray(data.userFriendlyMessages);
    self.checked = ko.observable(false);
    self.executable = ko.observable(data.executable);
    self.applied = ko.observable(data.applied);
    if (data.applied) {
        self.checked(true);
    }
    self.userFriendlyMessageString = ko.computed(function () {
        if (self.userFriendlyMessages()) {
            var msg = self.userFriendlyMessages().join(";");
            return msg;
        }
        return self.name;
    });
}

function ConsigneeAddress(param) {
    param = param || {};
    var self = this;
    this.id = ko.observable(param.id);
    this.isDefault = ko.observable(true);
    this.regionName = ko.observable(param.regionName);
    this.regionId = ko.observable(param.regionId);
    this.mobile = ko.observable(param.mobile);
    this.userName = ko.observable(param.userName);
    this.address = ko.observable(param.address);
    this.certificate = ko.observable(param.certificate || "");
    this.postalCode = ko.observable(param.postalCode);
    this.fullAddress = ko.computed(function () {
        return self.regionName() + self.address();
    });
    this.selected = ko.observable(false);
    //是否e刻达
    this.showInFastDelivery = ko.observable(true);
//    if(AppConfig.isFastDelivery){
//        this.showInFastDeliveryC = ko.dependentObservable(function(){
//            $.post(AppConfig.baseUrl+"phone_page/checkRange.jsp",{
//                               merchantId:AppConfig.merchantId,
//                                address: this.fullAddress()
//                            }, function(data){
//                                self.showInFastDelivery(data.status == 'ok');
//                            },"json"
//                   );
//
//        },self);
//    }
}

function DeliveryRuleResult(data) {
    var self = this;
    data = data || {};

    self.name = ko.observable(data.name);
    self.ruleId = ko.observable(data.ruleId);
    self.description = ko.observable(data.description);
    self.remark = ko.observable(data.remark);
    self.totalPriceString = ko.observable(data.totalPriceString);
    self.totalPrice = ko.observable(data.totalPrice);
    self.moneyTypeName = ko.observable(data.moneyTypeName);
    self.groupon = ko.observable(data.groupon);
    self.supportDP = ko.observable(data.supportDP);
    self.enableCOD = ko.observable(data.enableCOD);
    //self.availableDeliveryPoints = ko.observable(data.availableDeliveryPoints);
    self.availableDeliveryPoints = ko.observable($.map(data.availableDeliveryPoints || [], function (r) {
        return new DeliveryPoint(r);
    }));
    self.selectedDeliveryPointId = ko.observable(data.selectedDeliveryPointId);
    self.deliveryWayId = ko.observable(data.deliveryWayId);
    self.deliveryWayDescription = ko.observable(data.deliveryWayDescription);

    if (self.supportDP()) {
        self.deliveryPointSelector = new DeliveryPointSelector(data);
        self.deliveryPointSelector.setDeliveryPointList(self.availableDeliveryPoints());
        self.deliveryPointSelector.loadRegion(data.deliveryPointRegionId);
        self.deliveryPointRegionId = ko.computed(function () {
            return self.deliveryPointSelector.deliveryPointRegionId();
        });
    }
}

//配送时间
function DeliveryTime(data) {
    var self = this;
    data = data || {};
    self.id = ko.observable(data.id);
    self.name = ko.observable(data.name);
}
function DeliveryPoint(data) {
    var self = this;
    data = data || {};
    self.id = ko.observable(data.id);
    self.name = ko.observable(data.name);
    self.address = ko.observable(data.address);
    self.deliveryRuleId = ko.observable(data.deliveryRuleId);
    self.selected = ko.observable(data.selected);
    self.fee = ko.observable(data.fee);
    self.phone = ko.observable(data.phone);
}

function Invoice(invoice) {
    var self = this;
    invoice = invoice || {};
    self.id = ko.observable(invoice.id);
    self.invoiceTitle = ko.observable(invoice.invoiceTitle || "无需发票");
    self.invoiceTypeKey = ko.observable(invoice.invoiceTypeKey || "com"); //com代表普通发票,vat代表增值税发票,默认普通发票
    self.invoiceContent = ko.observable(invoice.invoiceContent || "");
    self.invoicePostAddress = ko.observable("");
    self.orderForm = ko.observable();
    self.invoiceNote = ko.computed(function () {
        var orderForm = self.orderForm();
        if(!orderForm){
            return "";
        }
        if (orderForm.isCrossBorder()) {
            return "备注:跨境商品不开发票";
        }
    });
    self.invoiceTypeName = ko.computed(function () {
        //com代表普通发票,vat代表增值税发票,默认普通发票
        if (!self.invoiceTypeKey() || self.invoiceTypeKey() == "com") {
            return "普通发票";
        } else {
            return "增值税发票";
        }
    });
    self.shortDesc = ko.computed(function () {
        if (self.invoiceTitle() == "无需发票") {
            return "" + self.invoiceTitle();
        } else {
            return "" + self.invoiceTitle() + "&nbsp;" + self.invoiceContent();
        }
    });
}
function Payment(data) {
    var self = this;
    data = data || {};
    self.id = ko.observable(data.id);
    self.name = ko.observable(data.name);
    self.payInterfaceId = ko.observable(data.payInterfaceId);
}
function BuyItem(data) {
    var self = this;
    data = data || {};
    self.icon = ko.observable(data.icon);
    self.productId = ko.observable(data.productId);
    self.columnId = ko.observable(data.columnId);
    self.columnIds = ko.observable(data.columnIds);
    self.productName = ko.observable(data.productName);
    self.number = ko.observable(data.number);
    self.unitPrice = ko.observable(data.unitPrice);
    self.totalPrice = ko.observable(data.totalPrice);
    self.unitDealPrice = ko.observable(data.unitDealPrice);
    /*满减后的成交价*/
    self.totalDealPrice = ko.observable(data.totalDealPrice);
    /*满减后的商品总成交价*/
    self.totalPrice = ko.observable(data.totalPrice);
    self.totalPayPrice = ko.observable(data.totalPayPrice);
    self.taxPrice = ko.observable(data.taxPrice);
    /*单个商品税*/
    self.totalTaxPrice = ko.observable(data.totalTaxPrice);
    /*商品行总税*/
    self.totalDiscount = ko.observable(data.totalDiscount);
    /*商品满减金额*/
    self.totalWeight = ko.observable(data.totalWeight / 1000);
    self.skuId = ko.observable(data.skuId);
    self.itemId = ko.observable(data.itemKey);
    self.cartId = ko.observable(data.cartId);
    self.readableAttributes = ko.observableArray(data.readableAttributes);
    self.attrsString = ko.observable(data.attrsString);
    self.checked = ko.observable(true);
    self.selectedOrderRuleId = ko.observable(data.selectedOrderRuleId);
    self.orderAvailableRules = ko.observableArray(data.orderAvailableRules || []);
    self.orderInclusiveRules = ko.computed(function () {
        var rules = [];
        $.each(self.orderAvailableRules(), function (idx, rule) {
            if (!rule.excludeOtherOrderRule == true) {
                rules.push(rule);
            }
        });
        return rules;
    });
    /*与其他规则互斥的规则*/
    self.excludeOtherOrderRule = ko.computed(function () {
        var rules = [];
        $.each(self.orderAvailableRules(), function (idx, rule) {
            if (rule.excludeOtherOrderRule == true) {
                rules.push(rule);
            }
        });
        return rules;
    });
    self.integralPrice = ko.observable(data.integralPrice || 0);
    self.totalIntegralPrice = ko.observable(data.totalIntegralPrice || 0);
    self.objType = ko.observable(data.objType);

    if (data.hasOwnProperty("checked")) {
        self.checked(data.checked);
    }
    self.checked.subscribe(function (newValue) {
        cartsPage.setCheckedItems();
    });
    self.toggle = function () {
        self.checked(!self.checked());
    };
    self.acceptedNumber = ko.computed({
        read: self.number,
        write: function (value) {
            if (isNaN(value)) {
                var oldValue = self.number();
                this.number(0);
                this.number(oldValue);
                layer.alert("购买数量必须是数字。")
            }
            else {
                this.number(value); // Write to underlying storage
                cartsPage.changeNumber(self, value);
            }
        },
        owner: this
    });
    var ruleTarget = new RuleTarget(data);
    $.extend(self, ruleTarget);
    /*这个商品行的折扣（含单品满减与订单满减的平摊值）*/
    self.totalDiscount = ko.computed(function () {
        return self.totalPrice() - self.totalDealPrice();
    });

    //组合商品
    self.isFreeGroupProduct = data.freeGroupProduct;
    self.isCombiProduct = data.combiProduct;
    self.combiItems = data.combiItems;
    if (data.combiItems) {
        $.each(data.combiItems, function (idx, item) {
            item.totalWeight = item.totalWeight / 1000;
            item.totalWeight = Number(item.totalWeight).toFixed(2);
        });
    }
}

function Oc(oc) {
    var self = this;
    oc = oc || {};
    //配送方式
    self.selectedDeliveryRule = ko.observable(null);
    self.selectedDeliveryRuleId = ko.observable();
    self.selectedDeliveryRuleName = ko.observable("");
    self.selectedDeliveryRulePrice = ko.observable("");
    self.selectedDeliveryRuleMoneyType = ko.observable("");
    self.selectedDeliveryRuleEnableCod = ko.observable(false);
    //自提点
    self.selectedDeliveryPointId = ko.observable(oc.selectedDeliveryPointId || "");
    self.selectedDeliveryPointName = ko.observable("");

    self.allCardBatches = oc.allCardBatches;
    self.availableRuleResults = oc.availableRuleResults;
    self.isCrossBorder = oc.crossBorder;/*是否跨境订单*/
    self.isCrossDirectMail = oc.crossDirectMail;/*是否跨境直邮订单*/
    self.isFastDelivery = oc.isFastDelivery; // 万家送
    self.isB2BOrder = oc.isB2BOrder;//是否b2b商家
    self.isCollectTax = oc.collectTax;/*是否收税*/
    //配送时间
    self.selectedDeliveryTimeId = ko.observable("");
    self.selectedDeliveryTimeName = ko.observable("");
    //是否支持积分、购物券等支付方式
    self.supportIntegral = oc.supportIntegral;
    self.supportStoreCard = oc.supportStoreCard;
    self.supportPreDeposit = oc.supportPreDeposit;
    self.supportTicket = oc.supportTicket;
    self.supportJiaJuQuan = oc.supportJiaJuQuan;

    self.merchantId = ko.observable(oc.merchantId);
    self.cartId = oc.cartKey;
    self.cartType = oc.cartType;
    self.merchantName = ko.observable(oc.merchantName);

    self.hasDeliveryRule = ko.observable(false);

    // 万家送自提点特别一点，要层层往下传直到selector
    self.wjsDeliveryPoints = ko.observable();
    self.wjsDeliveryPoints.subscribe(function () {
        self.deliveryResults().forEach(function (value) {
           if(value.supportDP()&& value.deliveryPointSelector){
               value.deliveryPointSelector.setDeliveryPointList(self.wjsDeliveryPoints());
               value.availableDeliveryPoints(self.wjsDeliveryPoints());
           }
        });
    });

    self.setDeliveryPoint = function (deliveryPoint) {
        if (deliveryPoint) {
            self.selectedDeliveryPointId(deliveryPoint.id());
            self.selectedDeliveryPointName(deliveryPoint.name());
        } else {
            self.selectedDeliveryPointId("");
            self.selectedDeliveryPointName("");
        }
        return true;
    };
    self.selectedDeliveryPointRegionId = ko.computed(function () {
        var selectedDeliveryRule = self.selectedDeliveryRule();
        if (selectedDeliveryRule && selectedDeliveryRule != null && selectedDeliveryRule.deliveryPointRegionId) {
            return selectedDeliveryRule.deliveryPointRegionId();
        } else {
            return "";
        }
    });
    self.setDeliveryRule = function (rule) {
        if (rule) {
            self.selectedDeliveryRule(rule);
            self.selectedDeliveryRuleId(rule.ruleId());
            self.selectedDeliveryRuleName(rule.name());
            self.selectedDeliveryRulePrice(rule.totalPriceString());
            self.selectedDeliveryRuleMoneyType(rule.moneyTypeName());
            self.selectedDeliveryRuleEnableCod(rule.enableCOD());
            if (rule.supportDP()) {

                if (rule.availableDeliveryPoints().length == 1) {
                    self.setDeliveryPoint(rule.availableDeliveryPoints()[0]);
                } else {
                    var dp = null;
                    $.each(rule.availableDeliveryPoints(), function (idx, deliveryPoint) {
                        if (deliveryPoint.id() == self.selectedDeliveryPointId()) {
                            dp = deliveryPoint;
                        }
                    });
                    if (dp == null) {
                        if (!self.isFastDelivery && !self.selectedDeliveryRule().supportDP()) {
                            self.setDeliveryPoint(null);
                        }
                    }
                    else {
                        self.setDeliveryPoint(dp);
                    }
                }
            }
        }
        else {
            self.selectedDeliveryRule(null);
            self.selectedDeliveryRuleId("");
            self.selectedDeliveryRuleName("");
            self.selectedDeliveryRulePrice("");
            self.selectedDeliveryRuleMoneyType("");
            self.selectedDeliveryRuleEnableCod(false);
        }
        return true;
    };

    self.selectDeliveryRule = function (ruleId) {
        if (!self.deliveryResults()) {
            self.setDeliveryRule(null);
            return;
        }
        if (!ruleId) {
            self.setDeliveryRule(null);
            return;
        }
        var r = null;
        $.each(self.deliveryResults(), function (idx, rule) {
            if (rule.ruleId() == ruleId) {
                r = rule;
            }

        });
        if (r == null) {
            self.setDeliveryRule(null);
        }
        else {
            self.setDeliveryRule(r);
        }
    };
    self.setDeliveryTime = function (rule) {
        if (rule) {
            self.selectedDeliveryTimeId(rule.id());
            self.selectedDeliveryTimeName(rule.name());
        } else {
            self.selectedDeliveryTimeId("");
            self.selectedDeliveryTimeName("");
        }
        return true;
    };

    self.selectDeliveryTime = function (ruleId) {
        if (!self.deliveryTimes()) {
            self.setDeliveryTime(null);
            return;
        }
        if (!ruleId) {
            self.setDeliveryTime(null);
            return;
        }
        var r = null;
        $.each(self.deliveryTimes(), function (idx, rule) {
            if (rule.id() == ruleId) {
                r = rule;
            }

        });
        if (r == null) {
            self.setDeliveryTime(null);
        }
        else {
            self.setDeliveryTime(r);
        }
    };

    try {
        self.totalOrderProductPrice = ko.observable(oc.totalOrderProductPrice);//商品金额
        self.totalIntegralPrice = ko.observable(oc.totalIntegralPrice || 0);//积分金额
        self.totalDeliveryFee = ko.observable(oc.totalDeliveryFee);//运费
        self.totalProductDiscount = ko.observable(oc.totalProductDiscount);//商品优惠
        self.totalOrderDiscount = ko.observable(oc.totalOrderDiscount);//订单优惠
        self.totalDeliveryFeeDiscount = ko.observable(oc.totalDeliveryFeeDiscount);//运费优惠
        self.finalPayAmount = ko.observable(oc.finalPayAmount);//需支付金额
        self.totalTaxPrice = ko.observable(oc.totalTaxPrice);//税金
        self.paymentList = ko.observable(oc.paymentList || []);
        self.selectedPaymentId = ko.observable(oc.selectedPaymentId);
        self.selectedPayment = ko.computed(function () {
            var payment = null;
            if (!self.paymentList()) {
                return null;
            }
            $.each(self.paymentList(), function (idx, p) {
                if (p.id == self.selectedPaymentId()) {
                    payment = p;
                }
            });
            return payment;
        });
        self.finalNeedPayAmount = ko.observable(oc.finalNeedPayAmount);
        self.selectedPayInterfaceId = ko.observable(oc.selectedPayInterfaceId);

        self.deliveryResults = ko.observable($.map(oc.availableDeliveryRuleResults || [], function (r) {
            r.deliveryPointRegionId = oc.deliveryPointRegionId;
            r.merchantId = oc.merchantId;
            return new DeliveryRuleResult(r);
        }));

        var deliveryResultsLength = self.deliveryResults().length;
        if (deliveryResultsLength == 0) {
            self.hasDeliveryRule(false);
        } else if (deliveryResultsLength == 1) {
            self.setDeliveryRule(self.deliveryResults()[0]);
            self.hasDeliveryRule(true);
        } else {
            self.selectDeliveryRule(oc.selectedDeliveryRuleId);
            self.hasDeliveryRule(true);
        }
        console.log("aaaa="+self.hasDeliveryRule());

        self.deliveryTimes = ko.observable($.map(oc.availableDeliveryTimes || [], function (r) {
            return new DeliveryTime(r);
        }));

        if (self.deliveryTimes().length == 1) {
            self.setDeliveryTime(self.deliveryTimes()[0]);
        } else {
            self.selectDeliveryTime(oc.selectedDeliveryTime);
        }
    }
    catch (e) {
        //console.log(e);
    }


    //获得商品数量
    if (oc.buyItems) {
        var items = $.map(oc.buyItems, function (item, i) {
            var item = new BuyItem(item);
            return item;
        });
        self.buyItems = ko.observableArray(items);
    }
    else {
        self.buyItems = ko.observableArray([]);
    }

    self.isEmpty = ko.computed(function () {
        var empty = true;
        $.each(self.buyItems(), function (idx, item) {
            if (item.checked()) {
                empty = false;
            }
        });
        return empty;
    });

    self.totalProductNumber = ko.computed(function () {
        var total = 0;
        $.each(self.buyItems(), function (i, buyItem) {
            total += buyItem.number();
        });
        return total;
    });
    /*是否需要支付税金*/
    self.needPayTax = ko.computed(function () {
        return self.totalTaxPrice() > AppConfig.maxTaxPrice;
    });
}