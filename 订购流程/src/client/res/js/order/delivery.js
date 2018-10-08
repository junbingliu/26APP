/**
 * Created by Administrator on 2014-07-06.
 */

function DeliveryChooser(data){
    var self = this;
    self.buyerId = null;
    self.merchantId = null;
    self.addressId = null;
    self.deliveryResults = ko.observableArray();
    self.selectedDeliveryId = ko.observable();
    self.setDeliveryRuleResults = function(ruleResults){
        var ruleResults =  $.map(ruleResults,function(ruleResult){
            return new DeliveryRuleResult(ruleResult);
        });
        self.deliveryResults(ruleResults);
    };

    self.select = function(deliveryRuleResult){
        self.selectedDeliveryId(deliveryRuleResult.ruleId());
    }
    self.back = function(){
        history.back();
    }
    self.setSelectedDeliveryRule = function(ruleResult){
        var postData = {
            buyerId : self.buyerId,
            merchantId: self.merchantId,
            addressId:self.addressId,
            ruleId:self.selectedDeliveryId()
        }
        $.post(AppConfig.url+AppConfig.setSelectedDeliveryRuleUrl,postData,function(ret){
            if(ret.state == 'ok'){
                self.back();
            }
            else{
                layer.alert("出错了。错误信息是：" + ret.msg );
            }
        },"json");
    }


}
var deliveryChooser = null;
$(document).ready(function () {
    if(deliveryChooser==null){
        deliveryChooser = new DeliveryChooser();
        ko.applyBindings(deliveryChooser, document.getElementById("deliveryChooserPage"));
    }
});
