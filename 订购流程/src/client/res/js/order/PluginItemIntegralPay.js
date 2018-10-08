function PluginItemIntegralPay (){
    var self = this;
    $.extend(self,new PluginItem());
    //self.prototype = new PluginItem();
    //积分与钱的会算比例
    self.integralMoneyRatio = ko.observable(1);
    //当前拥有的积分
    self.integralBalance = ko.observable(0);
    //用户输入，使用多少积分
    self.useMoney = ko.observable();
    self.confirmed = ko.observable(false);

    self.integralMoneyBalance = ko.computed(function(){
        return (Math.floor(self.integralBalance() * self.integralMoneyRatio() * 100)/100).toFixed(2);
    });
    self.orderForm = ko.observable(null);

    //计算所有允许用积分的oc,剩下多少钱还没有支付，其中能用积分支付的钱还剩下多少没有支付
    self.leftIntegralPayMoney = ko.computed(function(){
        var sum = 0;
        if(!self.orderForm()){
            return 0;
        }
        for(var i=0; i<self.orderForm().ocs().length; i++){
            var oc = self.orderForm().ocs()[i];
            if(oc.supportIntegral){
                //如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
                var curAmount = 0;
                curAmount = oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
                //需要减去用券支付的部分
                if(oc.usedTicketAmount){
                    curAmount -= oc.usedTicketAmount;
                }
                if(oc.usedPrepayCardAmount){
                    curAmount -= oc.usedPrepayCardAmount;
                }
                if (oc.usedDepositAmount) {
                    curAmount -= oc.usedDepositAmount;
                }
                if (oc.usedJiaJuQuanAmount) {
                    curAmount -= oc.usedJiaJuQuanAmount;
                }
                //由于积分和购物券不能用于支付运费，所以这里要判断能用积分支付的金额不能大于 商品金额 - 用券金额
                var productPrice = oc.totalOrderProductPrice() - (oc.usedTicketAmount || 0);
                if(productPrice < curAmount){
                    curAmount = productPrice;
                }
                sum += curAmount;
            }
        }
        return sum>0?sum:0;
    });

    self.calcCanUseMoney = ko.computed(function(){
        if(!self.orderForm()){
            return 0;
        }
        var balance = self.integralMoneyBalance();//积分兑换成人民币的金额
        var needPaid = self.leftIntegralPayMoney();//还剩能使用积分支付的金额
        return Number(balance>needPaid ? needPaid : balance).toFixed(2);
    });

    //现有的积分等于多少钱
    self.canUseMoney = ko.computed(function(){
        return self.calcCanUseMoney();
    });

    self.getPaidMoneyByThisPlugin = function(oc){
        return oc.usedIntegralAmount || 0;
    };


    self.useIntegral = ko.computed(function(useIntegral){
        //使用多少积分
        return Math.floor( self.useMoney()/self.integralMoneyRatio());
    });

    self.onInit = function(orderForm){
        self.orderForm(orderForm);
    };

    self.onUpdate = function(data){
        self.integralMoneyRatio(data.integralMoneyRatio);
        self.integralBalance(data.integralBalance);
    };

    self.onOrderFormChanged = function(orderForm){
        self.orderForm(orderForm);
    };

    self.setUseMoney = function(){
        var canUseMoney = self.calcCanUseMoney();
        if(Number(self.useMoney()) <= Number(canUseMoney)){
            var useMoney = Number(self.useMoney()).toFixed(2);
            self.useMoney(useMoney);
            self.confirmed(true);
        }
        else{
            self.useMoney(self.canUseMoney());
            self.confirmed(true);
        }

        var sum = 0;
        var left = self.useMoney();
        var maxNeedPay = 0;
        var maxNeedPayOc = null;
        //分摊
        $.each(self.orderForm().ocs(),function(idx,oc){
            //先将sum计算出来
            var needPay = oc.totalOrderProductPrice();
            if(oc.usedTicketAmount){
                needPay -= oc.usedTicketAmount;
            }
            if(oc.usedPrepayCardAmount){
                needPay -= oc.usedPrepayCardAmount;
            }
            if (oc.usedDepositAmount) {
                needPay -= oc.usedDepositAmount;
            }
            if (oc.usedJiaJuQuanAmount) {
                needPay -= oc.usedJiaJuQuanAmount;
            }
            if(maxNeedPay < needPay){
                maxNeedPay = needPay;
                maxNeedPayOc = oc;
            }
            sum+=needPay;
        });

        $.each(self.orderForm().ocs(),function(idx,oc){
            var needPay = oc.totalOrderProductPrice();
            if(oc.usedTicketAmount){
                needPay -= oc.usedTicketAmount;
            }
            if(oc.usedPrepayCardAmount){
                needPay -= oc.usedPrepayCardAmount;
            }
            if (oc.usedDepositAmount) {
                needPay -= oc.usedDepositAmount;
            }
            if (oc.usedJiaJuQuanAmount) {
                needPay -= oc.usedJiaJuQuanAmount;
            }
            oc.usedIntegralAmount = Number(((needPay/sum) * self.useMoney()).toFixed(2));
            left -= oc.usedIntegralAmount;
        });
        if(left != 0){
            maxNeedPayOc.usedIntegralAmount = (maxNeedPayOc.usedIntegralAmount + left);
        }
        self.orderForm().updatePayRec({payInterfaceId:"payi_4",name:"积分支付",money:self.useMoney()});
    };
    self.edit = function(){
        self.confirmed(false);
    };

}