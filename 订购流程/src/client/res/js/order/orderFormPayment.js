function OrderFormPayment(){
    var self = this;
    self.paymentList = ko.observableArray();
    self.selectedId = ko.observable();
    self.merchantId = null;
    self.callback = null;
    self.buyerId = null;
    self.getSelectedPayment = function(){
        if(!self.selectedId()){
            return null;
        }
        var result = null;
        $.each(self.paymentList(),function(idx,elem){
            if(elem.id()==self.selectedId()){
                result = elem;
            }
        });
        return result;
    }

    self.saveSelectedPayment = function(){
        var postData = {
            buyerId:self.buyerId,
            merchantId:self.merchantId,
            selectedPayInterfaceId:self.getSelectedPayment().payInterfaceId()
        }

        $.post(AppConfig.url+AppConfig.saveSelectedPaymentUrl,postData,function(ret){
            if(ret.state=='ok'){
                if(self.callback){
                    self.callback();
                }
            }
        },"json");
    }

    self.init = function(paymentList,selectedId){
        self.paymentList($.map(paymentList,function(payment){
            return new Payment(payment);
        }));
        self.selectedId(selectedId);
    }

    self.select = function(payment){
        self.selectedId(payment.id());
    }
    self.back = function(){
        history.back();
    }
}
var orderFormPayment =  null;
$(document).on("koInit",function(){
    orderFormPayment = new OrderFormPayment();
    var elem = document.getElementById("orderFormPaymentChooser");
    if(elem){
        ko.applyBindings(orderFormPayment, elem);
    }
});
/*
$(document).ready(function () {
    orderFormPayment = new OrderFormPayment();
    ko.applyBindings(orderFormPayment, document.getElementById("orderFormPaymentChooser"));
});*/
