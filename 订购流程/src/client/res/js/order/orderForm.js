function Address(address){
    var self = this;
    var address = address || {};
    self.userName = ko.observable(address.userName);
    self.regionName = ko.observable(address.regionName);
    self.id = ko.observable(address.id);
    self.postCode = ko.observable(address.postCode);
    self.mobile = ko.observable(address.mobile);
    self.regionId = ko.observable(address.regionId);
    self.address = ko.observable(address.address);
    self.selectedDeliveryRuleId = ko.observable(address.selectedDeliveryRuleId);
    self.setData = function(data){
        var data = data || {};
        self.userName(data.userName);
        self.id(data.id);
        self.postCode(data.postCode);
        self.mobile(data.mobile);
        self.regionId(data.regionId);
        self.address(data.address);
        self.selectedDeliveryRuleId(data.selectedDeliveryRuleId);
        self.regionName(data.regionName);
    }
};

function OrderForm(){
    var self = this;
    self.deliveryAddress = new Address();
    self.invoice = ko.observable(new Invoice());
    self.memo = ko.observable();
    self.finalNeedPayAmount = ko.observable();
    self.cartId = "";
    self.orderId = ko.observable("");
    self.cartType="";
    self.deliveryRules = ko.observableArray();
    self.selectedDeliveryRuleId = ko.observable();
    self.selectedDeliveryRuleName = ko.observable("");
    self.selectedDeliveryRulePrice = ko.observable("");
    self.selectedDeliveryRuleMoneyType = ko.observable("");
    self.merchantId=ko.observable("");
    self.setDeliveryRule = function(rule){
        self.selectedDeliveryRuleId(rule.ruleId);
        self.selectedDeliveryRuleName(rule.name);
        self.selectedDeliveryRulePrice(rule.totalPriceString);
        self.selectedDeliveryRuleMoneyType(rule.moneyType);
    }
    self.payments = ko.observableArray();
    self.selectedPaymentId = ko.observable();
    self.selectPayment = function(payment){
        self.selectedPaymentId(payment.id);
    }
    self.selectedPayment = ko.computed(function(){
        var sel = {};
        self.payments().forEach(function(p){
            if(p.id == self.selectedPaymentId()){
               sel = p;
            }
        });
        return sel;
    });
    self.saveSelectedPayment = function(){
        $.post(AppConfig.url + AppConfig.setDefaultMobilePaymentUrl,{paymentId:self.selectedPaymentId,merchantId:self.merchantId()},function(ret){
            if(ret.state=='ok'){
                self.backMain();
            }
        },"json")
    }
    self.askForPayment = function(){
        orderFormPayment.buyerId = self.buyerId;
        orderFormPayment.merchantId = self.merchantId;
        orderFormPayment.callback = function(){
            window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
        }
        orderFormPayment.init(self.payments(),self.selectedPaymentId());
        window.location.href = "#/orderFormPayment";
    }
    self.selectDeliveryRule = function(ruleId){
        if(!self.deliveryRules()){
            self.setDeliveryRule({});
            return;
        }
        if(!ruleId){
            self.setDeliveryRule({});
            return;
        }
        var r = null;
        $.each(self.deliveryRules(),function(idx,rule){
            if(rule.ruleId==ruleId){
                r = rule;
            };

        })
        if(r==null){
            self.setDeliveryRule({});
        }
        else{
            self.setDeliveryRule(r);
        }
    };
    /**
     * 所有商品价格
     */
    self.totalProductPrice = ko.computed(function(){});
    self.chooseAddress = function(){
        consignee.setCallback(function(consignee){
            window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
        });
        consignee.selectedAddressId(self.deliveryAddress.id());
        window.location.href = "#/consignee/" + self.buyerId;
     }

    self.currentPage = ko.observable("orderFormMain");
    self.askForInvoice = function(){
        invoiceChooser.buyerId = self.buyerId;
        invoiceChooser.merchantId = self.merchantId();
        invoiceChooser.callback = function(){
            window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
        }
        invoiceChooser.getInvoiceList();
        invoiceChooser.selectedInvoiceId(self.invoice().id());
        window.location.href="#/invoice";
    }
    self.askForDeliveryRule = function(){
        if(!self.deliveryAddress.regionId()){
            layer.alert("请先选择配送地址，再选择配送方式。");
            return;
        }
        deliveryChooser.buyerId = self.buyerId;
        deliveryChooser.merchantId = self.merchantId();
        deliveryChooser.addressId = self.deliveryAddress.id();
        deliveryChooser.setDeliveryRuleResults(self.deliveryRules());
        deliveryChooser.selectedDeliveryId(self.selectedDeliveryRuleId());
        window.location.href="#/delivery";
    }

    self.askForMemo = function(){
        self.currentPage("orderFormMemo");
    }

    self.backMain = function(){
        self.currentPage("orderFormMain");
    }

    self.loadOrderForm = function(cartId,buyerId){
        var postData = {
            cartId:cartId
        };
        if(buyerId){
            postData.buyerId = buyerId;
        }
        $.post(AppConfig.url+AppConfig.orderFormUrl,postData,function(ret){
            if(ret.state=='err'){
               layer.alert("出现错误！" + ret.msg);
               window.location.href = "/";
                return;
            }
            self.cartId = cartId;
            self.buyerId = buyerId;
            self.merchantId(ret.oc.merchantId);
            if(ret.deliveryAddress==null){
                self.deliveryAddress.setData({});
                self.chooseAddress();
                return;
            }
            else{
                self.deliveryAddress.setData(ret.deliveryAddress);
            }

            self.deliveryRules(ret.oc.availableDeliveryRuleResults);
            if(!ret.oc.selectedDeliveryRuleId || ret.oc.selectedDeliveryRuleId==""){
                self.askForDeliveryRule();
                return;
            }
            self.selectDeliveryRule(ret.oc.selectedDeliveryRuleId);

            self.finalNeedPayAmount(ret.oc.finalNeedPayAmount);
            self.cartType = ret.oc.cartType;
            ret.oc.invoiceInfo.id = ret.oc.invoiceInfo.invoiceId;
            self.invoice(new Invoice(ret.oc.invoiceInfo));
            /*设置默认支付方式*/
            if(ret.paymentList){
               self.payments(ret.paymentList);
            }
            self.selectedPaymentId(ret.selectedPaymentId);
            if(!ret.selectedPaymentId || ret.selectedPaymentId==""){
                self.askForPayment();
                return;
            }

            $("#orderFormPage").fadeIn();

        },"json");
    }

    self.addOrder = function(){
        if(!self.selectedDeliveryRuleId()){
            layer.alert("没有选择配送方式。");
            return;
        }
        if(!self.selectedPaymentId()){
            layer.alert("没有选择支付方式。");
            return;
        }
        var postData = {
            cartId:self.cartId,
            memo:self.memo(),
            buyerId:self.buyerId,
            /*invoiceTitle:self.invoice().invoiceTitle(),
            invoiceContent:self.invoice().invoiceContent(),
            needInvoiceKey : self.invoice().needInvoiceKey(),
            invoiceType:"普通发票",*/
            selectedPaymentId : self.selectedPaymentId()
        };
        var postUrl = "";
        if(self.cartType=='common'){
            postUrl = AppConfig.addOrderUrl;
        }
        else if(self.cartType=='panic'){
            postUrl = AppConfig.url + AppConfig.qiangAddOrderUrl;
        }
        $.post(postUrl,postData,function(ret){
            if(ret.state=='ok'){
                layer.alert("生成订单成功！订单号：" + ret.orderId);
            }else{
                layer.alert(ret.msg);
            }
        },"JSON");
    }



}
var orderFormPage = null;
$(document).ready(function(){
    orderFormPage = new OrderForm();
    ko.applyBindings(orderFormPage,document.getElementById("orderFormPage"));
});