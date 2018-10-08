/**
 * Created by Administrator on 14-1-24.
 */

function AddressList(){
    var self = this;
    self.addresses = ko.observableArray([]);
    self.isEmpty = ko.computed(function(){
        if(self.addresses().length==0){
            return true;
        }
        return false;
    });
    self.back = function(){
        window.history.back();
    }
    self.load = function(){
        $.post(AppConfig.url+AppConfig.addressListUrl,{},function(ret){

        },"JSON");
    }
}
var addressListPage = null;
$(document).ready(function(){
    addressListPage = new AddressList();
    ko.applyBindings(addressListPage,document.getElementById("addressListPage"));
});


