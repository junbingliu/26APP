function PluginItem(){
    var self = this;
    self.detailVisible = ko.observable(false);
    self.orderForm = null;
    self.toggle = function(){
        self.detailVisible(!self.detailVisible());
    }

    self.onInit = function(orderForm){
        self.orderForm = orderForm;
    }


    self.onUpdate = function(orderForm){
        //should be override
    }

    self.onOrderFormChanged = function(orderForm){

    }
}