function PluginItemPreDepositPay() {
    var self = this;
    $.extend(self, new PluginItem());

    self.depositBalance = ko.observable(0);
    self.depositAppliedColumnIds = ko.observable(0);
    //用户输入，使用多少钱
    self.useMoney = ko.observable();
    //可用的预存款金额
    self.canUsePredeposit = ko.observable();
    self.confirmed = ko.observable(false);
    self.orderForm = ko.observable(null);

    //计算所有允许用预存款的oc,剩下多少钱还没有支付，其中能用预存款支付的钱还剩下多少没有支付
    self.leftDepositPayMoney = ko.computed(function () {
        var sum = 0;
        if (!self.orderForm()) {
            return 0;
        }

        for (var i = 0; i < self.orderForm().ocs().length; i++) {
            var oc = self.orderForm().ocs()[i];
            if (oc.supportPreDeposit) {
                //如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
                sum += oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
                //需要减去用券支付的部分
                if (oc.usedTicketAmount) {
                    sum -= oc.usedTicketAmount;
                }
                //用储值卡的
                if (oc.usedPrepayCardAmount) {
                    sum -= oc.usedPrepayCardAmount;
                }
                //用积分的
                if (oc.usedIntegralAmount) {
                    sum -= oc.usedIntegralAmount;
                }
                //用家居券支付的
                if (oc.usedJiaJuQuanAmount) {
                    sum -= oc.usedJiaJuQuanAmount;
                }

                if (self.depositAppliedColumnIds() && self.depositAppliedColumnIds().length > 0) {
                    //如果有设置预存款使用规则
                    var buyItems = oc.buyItems();

                    for (var k = 0; k < buyItems.length; k++) {
                        var jItem = buyItems[k];

                        if (!checkColumnId(jItem.columnIds())) {
                            //减去不满足使用预存款的的item金额
                            sum -= jItem.totalPayPrice();
                        }
                    }
                }

            }
        }

        function checkColumnId(ids) {
            var columnIds = ids.split(",");
            for (var n = 0; n < self.depositAppliedColumnIds().length; n++) {
                var cid = self.depositAppliedColumnIds()[n];
                for (var m = 0; m < columnIds.length; m++) {
                    if (columnIds[m] == cid) {
                        return true;
                    }

                }

            }


            return false;
        }

        return sum > 0 ? sum : 0;
    });

    self.getCanUsePredeposit = ko.computed(function () {
        if (!self.orderForm()) {
            return 0;
        }
        var balance = self.depositBalance();
        var needPaid = self.leftDepositPayMoney();
        return Number(balance > needPaid ? needPaid : balance).toFixed(2);
    });

    self.calcCanUseMoney = ko.computed(function () {
        if (!self.orderForm()) {
            return 0;
        }
        var balance = self.depositBalance();
        var needPaid = self.leftDepositPayMoney();
        return Number(balance > needPaid ? needPaid : balance).toFixed(2);
    });

    //现有的积分等于多少钱
    self.canUseMoney = ko.computed(function () {
        return self.calcCanUseMoney();
    });

    self.getPaidMoneyByThisPlugin = function (oc) {
        return oc.usedDepositAmount || 0;
    };

    self.onInit = function (orderForm) {
        self.orderForm(orderForm);
    };

    self.onUpdate = function (data) {
        self.depositBalance(data.depositBalance);
        self.depositAppliedColumnIds(data.depositAppliedColumnIds);
    };

    self.onOrderFormChanged = function (orderForm) {
        self.orderForm(orderForm);
    };

    self.setUseMoney = function () {
        var canUseMoney = self.calcCanUseMoney();
        if (Number(self.useMoney()) <= Number(canUseMoney)) {
            var useMoney = Number(self.useMoney()).toFixed(2);
            self.useMoney(useMoney);
            self.confirmed(true);
        }
        else {
            self.useMoney(self.canUseMoney());
            self.confirmed(true);
        }

        var sum = 0;
        var left = self.useMoney();
        var maxNeedPay = 0;
        var maxNeedPayOc = null;
        //分摊
        $.each(self.orderForm().ocs(), function (idx, oc) {
            //先将sum计算出来
            var needPay = oc.finalPayAmount();
            if (oc.usedTicketAmount) {
                needPay -= oc.usedTicketAmount;
            }
            if (oc.usedPrepayCardAmount) {
                needPay -= oc.usedPrepayCardAmount;
            }
            if (oc.usedIntegralAmount) {
                needPay -= oc.usedIntegralAmount;
            }
            if (oc.usedJiaJuQuanAmount) {
                needPay -= oc.usedJiaJuQuanAmount;
            }
            if (maxNeedPay < needPay) {
                maxNeedPay = needPay;
                maxNeedPayOc = oc;
            }
            sum += needPay;
        });

        $.each(self.orderForm().ocs(), function (idx, oc) {
            var needPay = oc.finalPayAmount();
            if (oc.usedTicketAmount) {
                needPay -= oc.usedTicketAmount;
            }
            if (oc.usedPrepayCardAmount) {
                needPay -= oc.usedPrepayCardAmount;
            }
            if (oc.usedIntegralAmount) {
                needPay -= oc.usedIntegralAmount;
            }
            if (oc.usedJiaJuQuanAmount) {
                needPay -= oc.usedJiaJuQuanAmount;
            }
            oc.usedDepositAmount = Number(((needPay / sum) * self.useMoney()).toFixed(2));
            left -= oc.usedDepositAmount;
        });
        if (left != 0) {
            maxNeedPayOc.usedDepositAmount = (maxNeedPayOc.usedDepositAmount + left);
        }
        self.orderForm().updatePayRec({payInterfaceId: "payi_5", name: "预存款支付", money: self.useMoney()});
    };
    self.edit = function () {
        self.confirmed(false);
    }

}