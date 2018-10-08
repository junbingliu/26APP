function PluginItemJiaJuQuanPay() {
    var self = this;
    $.extend(self, new PluginItem());

    //家居券余额
    self.mobile = ko.observable("");
    self.jiaJuQuanNo = ko.observable("");
    self.jiaJuQuanBalance = ko.observable(0);
    //用户输入，使用多少家居券
    self.useMoney = ko.observable();
    self.confirmed = ko.observable(false);
    self.useConfirmed = ko.observable(false);
    self.checkingBalance = ko.observable(false);

    self.orderForm = ko.observable(null);

    //计算所有允许用积分的oc,剩下多少钱还没有支付，其中能用积分支付的钱还剩下多少没有支付
    self.leftJiaJuQuanPayMoney = ko.computed(function () {
        var sum = 0;
        if (!self.orderForm()) {
            return 0;
        }
        for (var i = 0; i < self.orderForm().ocs().length; i++) {
            var oc = self.orderForm().ocs()[i];
            if (oc.supportJiaJuQuan) {
                //如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
                var curAmount = 0;
                curAmount = oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
                //需要减去用券支付的部分
                if (oc.usedTicketAmount) {
                    curAmount -= oc.usedTicketAmount;
                }
                if (oc.usedPrepayCardAmount) {
                    curAmount -= oc.usedPrepayCardAmount;
                }
                if (oc.usedDepositAmount) {
                    curAmount -= oc.usedDepositAmount;
                }
                if (oc.usedIntegralAmount) {
                    curAmount -= oc.usedIntegralAmount;
                }
                sum += curAmount;
            }
        }
        return sum > 0 ? sum : 0;
    });

    self.calcCanUseMoney = ko.computed(function () {
        if (!self.orderForm()) {
            return 0;
        }
        var balance = Number(self.jiaJuQuanBalance());
        var needPaid = self.leftJiaJuQuanPayMoney();
        return Number(balance > needPaid ? needPaid : balance).toFixed(2);
    });

    self.canUseMoney = ko.computed(function () {
        return self.calcCanUseMoney();
    });

    self.getPaidMoneyByThisPlugin = function (oc) {
        return oc.usedIntegralAmount || 0;
    };

    self.onInit = function (orderForm) {
        self.orderForm(orderForm);

    };

    self.onUpdate = function (data) {
        self.mobile(data.buyerMobile);
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
            self.useConfirmed(true);
        }
        else {
            self.useMoney(self.canUseMoney());
            self.confirmed(true);
            self.useConfirmed(true);
        }

        var sum = 0;
        var left = self.useMoney();
        var maxNeedPay = 0;
        var maxNeedPayOc = null;
        //分摊
        $.each(self.orderForm().ocs(), function (idx, oc) {
            //先将sum计算出来
            var needPay = oc.totalOrderProductPrice();
            if (oc.usedTicketAmount) {
                needPay -= oc.usedTicketAmount;
            }
            if (oc.usedPrepayCardAmount) {
                needPay -= oc.usedPrepayCardAmount;
            }
            if (oc.usedDepositAmount) {
                needPay -= oc.usedDepositAmount;
            }
            if (oc.usedIntegralAmount) {
                needPay -= oc.usedIntegralAmount;
            }
            if (maxNeedPay < needPay) {
                maxNeedPay = needPay;
                maxNeedPayOc = oc;
            }
            sum += needPay;
        });

        $.each(self.orderForm().ocs(), function (idx, oc) {
            var needPay = oc.totalOrderProductPrice();
            if (oc.usedTicketAmount) {
                needPay -= oc.usedTicketAmount;
            }
            if (oc.usedPrepayCardAmount) {
                needPay -= oc.usedPrepayCardAmount;
            }
            if (oc.usedDepositAmount) {
                needPay -= oc.usedDepositAmount;
            }
            if (oc.usedIntegralAmount) {
                needPay -= oc.usedIntegralAmount;
            }
            oc.usedJiaJuQuanAmount = Number(((needPay / sum) * self.useMoney()).toFixed(2));
            left -= oc.usedJiaJuQuanAmount;
        });
        if (left != 0) {
            maxNeedPayOc.usedJiaJuQuanAmount = (maxNeedPayOc.usedIntegralAmount + left);
        }
        self.orderForm().updatePayRec({payInterfaceId: "payi_160", name: "品牌家居券支付", money: self.useMoney()});
    };
    self.edit = function () {
        self.confirmed(false);
    };
    self.editUse = function () {
        self.useConfirmed(false);
    };

    self.loadBalance = function () {
        self.checkingBalance(true);

        var codeMobile = escape(self.mobile);
        var codeJiaJuQuanNo = escape(self.jiaJuQuanNo);
        cons

        var postData = {};
        postData.mobile = codeMobile;
        postData.jiaJuQuanNo = codeJiaJuQuanNo;
        $.post(AppConfig.url + "/buyflowApp/server/order/getJiaJuQuanInfo.jsx", postData, function (ret) {
            self.checkingBalance(false);
            if (ret.state == 'err') {
                confirmDialog.show(ret.msg);
                return;
            }
            self.jiaJuQuanBalance(ret.remainAmount);
            self.confirmed(true);
        }, 'json');
    };

}