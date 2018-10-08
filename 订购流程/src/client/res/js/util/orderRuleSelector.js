function OrderRuleSelector(){
    var self = this;
    self.rules = ko.observableArray();
    self.callBack = null;
    self.isShow = ko.observable(false);
    self.show = function(rules,selectedRule,callBack){
        if(!rules){
            return;
        }
        self.rules(rules);
        self.selectedRule(selectedRule);
        self.callBack = callBack;
        $("#orderRuleSelector").show(200);
    }
    self.selectedRule = ko.observable();

    self.ok = function(){
        $("#orderRuleSelector").hide();
        if(self.callBack){
            self.callBack(self.selectedRule());
        }
        self.selectedRule(null);
    }

    self.cancel = function(){
        $("#orderRuleSelector").hide();
    }
}

var orderRuleSelector = new OrderRuleSelector();
$(document).on("koInit",function(event,extraParams){
    var root = document.getElementById("orderRuleSelector");
    if(root){
        ko.applyBindings(orderRuleSelector,root);
    }
});