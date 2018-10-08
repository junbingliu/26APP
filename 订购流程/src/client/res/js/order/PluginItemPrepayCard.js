function PrepayCard(data) {
    var self = this;
    self.cardNo = data.cardNo;
    self.cardId = data.cardId;
    self.cardAmount = data.cardAmount;
    self.useAmount = ko.observable(data.useAmount || 0);
    self.parent = null;
    self.loading = ko.observable(false);
    self.loadSuccess = ko.observable(true);
    self.guardedUseAmount = ko.computed({
        read: function () {
            return self.useAmount().toFixed(2);
        },
        write: function (value) {

            // Strip out unwanted characters, parse as float, then write the
            // raw data back to the underlying "price" observable
            value = parseFloat(value.replace(/[^\.\d]/g, ""));
            if (isNaN(value)) {
                confirmDialog.show("不正确的金额!");
                return;
            }
            if (value > Number(self.cardAmount)) {
                confirmDialog.show("不正确的金额,超出了卡余额!");
                return;
            }
            var leftPayAmount = Number(self.parent.leftAmount());
            if(leftPayAmount <= 0 && self.useAmount() == 0){
                confirmDialog.show("订单已经全部支付，不需要再使用预付卡支付了哦!");
                self.useAmount(value);
                self.useAmount(0);
                return;
            }
            leftPayAmount = leftPayAmount + self.useAmount();
            if (Number(leftPayAmount) < Number(value)) {
                value = leftPayAmount;
            }
            //不需设置一下,ko会认为数据没改变,不会修改页面的值
            self.useAmount(0);
            self.useAmount(isNaN(value) ? 0 : value); // Write to underlying storage
        },
        owner: this
    });
}
function BindCard(data) {
    var self = this;
    self.cardNo = data.cardNo;
    self.password = data.password;
}
function PluginItemPrepayCard() {
    var self = this;
    $.extend(self, new PluginItem());

    self.loading = ko.observable(true);
    self.cards = ko.observableArray();
    self.checkingCard = ko.observable(false);
    self.bindCards = ko.observableArray();

    self.adding = ko.observable(false);
    self.newCardNo = ko.observable();
    self.newCardPassword = ko.observable();

    self.removeCard = function (card) {
        self.cards.remove(card);
    };

    self.beginAdd = function () {
        self.adding(true);
        self.newCardNo("");
        self.newCardPassword("");
    };

    //剩下需要用预付卡支付的金额
    self.leftAmount = function () {
        var sum = 0;
        if (!self.orderForm) {
            return 0;
        }
        for (var i = 0; i < self.orderForm.ocs().length; i++) {
            var oc = self.orderForm.ocs()[i];
            if (oc.supportStoreCard) {
                //如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
                sum += oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
                //需要减去用券支付的部分
                if (oc.usedTicketAmount) {
                    sum -= oc.usedTicketAmount;
                }
                if (oc.usedIntegralAmount) {
                    sum -= oc.usedIntegralAmount;
                }
                if (oc.usedDepositAmount) {
                    sum -= oc.usedDepositAmount;
                }
            }
        }
        sum -= self.totalUseAmount();
        return sum > 0 ? sum : 0;
    };


    self.doAdd = function (data) {
        var cardNo = self.newCardNo();
        var password = self.newCardPassword();
        if (!cardNo) {
            confirmDialog.show("您还没有输入卡号。");
            return;
        }
        if (!password) {
            confirmDialog.show("请输入网上支付密码。");
            return;
        }
        var duplicated = false;
        $.each(self.cards(), function (idx, card) {
            if (card.cardNo == cardNo) {
                duplicated = true;
            }
        });
        /* self.cards().forEach(function(card){
         if(card.cardNo == cardNo){
         duplicated = true;
         }
         });*/
        if (duplicated) {
            confirmDialog.show("您输入了重复的卡号。");
            return;
        }
        self.checkingCard(true);
        $.post(AppConfig.url+"/buyflowApp/server/order/getPrepayCardInfo.jsx", {cardNo: self.base64Encrypt(cardNo), password: self.base64Encrypt(password)}, function (ret) {
            self.adding(false);
            self.checkingCard(false);
            if (ret.state == 'err') {
                confirmDialog.show(ret.msg);
                return;
            }
            var card = new PrepayCard({
                cardNo: cardNo,
                cardId: cardNo,
                cardAmount: Number(ret.remainAmount),
                useAmount: Number(ret.remainAmount) > self.leftAmount() ? self.leftAmount() : Number(ret.remainAmount)
            });
            card.parent = self;
            var leftPayAmount = Number(self.orderForm.leftPayAmount());
            card.useAmount.subscribe(function () {
                setTimeout(function () {
                    self.confirm()
                }, 1)
            });
            if (leftPayAmount < card.useAmount()) {
                card.useAmount(leftPayAmount)
            }
            self.cards.push(card);
            if (data) {
                self.bindCards.remove(data);
            }
        }, "json");
        self.adding(false);
    };
    //原生使用预付卡回调方法
    self.usePrepayCardForApp = function(data){
        self.cards([]);
        for(var i=0;i<data.length;i++){
            var card = new PrepayCard({
                cardNo: data[i].cardNo,
                cardId: data[i].cardNo,
                cardAmount: Number(data[i].remainAmount),
                useAmount: Number(data[i].useAmount)
            });
            card.useAmount.subscribe(function () {
                setTimeout(function () {
                    self.confirm()
                }, 1)
            });
            card.useAmount(Number(data[i].useAmount));
            self.cards.push(card);
        }
    };

    self.onInit = function (orderForm) {
        self.orderForm = orderForm;
        self.loadBindCard();
    };

    self.onUpdate = function (data) {
    };
    self.totalUseAmount = ko.computed(function () {
        var useAmount = 0;
        $.each(self.cards(), function (idx, card) {
            useAmount = useAmount + Number(card.useAmount());
        });
        /*self.cards().forEach(function(card){
         useAmount = useAmount + Number(card.useAmount());
         });*/
        return useAmount.toFixed(2);
    });

    self.cards.subscribe(function () {
        self.confirm();
    });

    self.onAddOrder = function () {
        var cards = [];
        $.each(self.cards(), function (idx, card) {
            if (card.useAmount() > 0) {
                cards.push({
                    cardNo: card.cardNo,
                    cardId: card.cardId,
                    useAmount: card.useAmount()
                });
            }
        });
        /*self.cards().forEach(function(card){
         cards.push({
         cardNo:card.cardNo,
         cardId:card.cardId,
         useAmount:card.useAmount()
         });
         });*/
        return {
            prepayCards: JSON.stringify(cards)
        }
    };

    self.confirm = function () {
        var sum = self.totalUseAmount();
        var left = sum;
        var maxNeedPay = 0;
        var maxNeedPayOc = null;
        $.each(self.orderForm.ocs(), function (i, oc) {
            var needPay = oc.finalPayAmount();
            if (oc.usedIntegralAmount) {
                needPay -= oc.usedIntegralAmount;
            }
            if (oc.usedTicketAmount) {
                needPay -= oc.usedTicketAmount;
            }
            if (oc.usedDepositAmount) {
                needPay -= oc.usedDepositAmount;
            }
            if (maxNeedPay < needPay) {
                maxNeedPay = needPay;
                maxNeedPayOc = oc;
            }
            if(needPay > 0){
                oc.usedPrepayCardAmount = Number(((needPay / sum) * self.totalUseAmount()).toFixed(2));
                left -= oc.usedPrepayCardAmount;
            }else{
                oc.usedPrepayCardAmount = 0;
                //console.log("needPay:"+needPay);
            }
        });
        if (left != 0) {
            maxNeedPayOc.usedPrepayCardAmount = maxNeedPayOc.usedPrepayCardAmount + left;
        }
        self.orderForm.updatePayRec({payInterfaceId: "payi_10", name: "预付卡/礼品卡支付", money: self.totalUseAmount()})
    };

    self.getPaidMoneyByThisPlugin = function (oc) {
        return oc.usedPrepayCardAmount || 0;
    };
    self.doBindCardAdd = function (data) {
        self.newCardNo(data.cardNo);
        self.newCardPassword(data.password);
        self.doAdd(data);
    };
    self.loadBindCard = function () {
        //获取用户绑定的预付卡,并读取出余额
        $.post(AppConfig.url+"/buyflowApp/server/order/getUserPrepayCardList.jsx", {}, function (ret) {
            if (ret.total > 0) {
                var cards = ret.cards;
                for (var i = 0; i < cards.length; i++) {
                    var returnCard = cards[i];
                    var card = new BindCard({
                        cardNo: returnCard.cardNo,
                        password: ''
                    });
                    self.bindCards.push(card);
                }
                self.checkingCard(false);
                self.adding(false);
            }
        }, "json");
    };
    //查询余额
    self.loadBalance = function (card) {
        card.loading(true);
        $.post(AppConfig.url+"/buyflowApp/server/order/getPrepayCardInfo.jsx", {cardNo: card.cardNo, password: ''}, function (ret) {
            if (ret.state == 'err') {
                confirmDialog.show(ret.msg);
                self.adding(false);
                self.checkingCard(false);
                return;
            }
            card.cardAmount = ret.remainAmount;
            card.loadSuccess(true);
            card.loading(false);
        }, 'json');
    };
    self.base64Encrypt = function (data) {
        if (typeof CryptoJS == "undefined") {
            return data;
        }
        var str = CryptoJS.enc.Utf8.parse(data);
        return CryptoJS.enc.Base64.stringify(str);
    };
}