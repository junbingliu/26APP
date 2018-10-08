function RuleSelectorDialog() {
    var self = this;
    self.availableRuleResults = ko.observableArray([]);
    self.callBack = null;
    self.layerIndex = null;
    self.setAvailableRuleResults = function (ruleResults) {
        self.availableRuleResults($.map(ruleResults, function (result) {
            return new RuleResult(result);
        }));

    }

    self.show = function (ruleResults, callBack) {
        if (!ruleResults) {
            return;
        }
        self.callBack = callBack;
        self.setAvailableRuleResults(ruleResults);
        if($.layer){
            self.layerIndex = $.layer({
                    type: 1,
                    area: ['600px', '500px'],
                    offset: ['100px', ''],
                    page: {dom: '#ruleSelectorDialog'}
                }
            );
        }
        else{
            $('#ruleSelectorDialog').show(300);
        }

    }

    self.ok = function () {
        if($.layer){
            layer.close(self.layerIndex);
        }
        else{
            $('#ruleSelectorDialog').hide(300);
        }
        if (self.callBack) {
            self.callBack(self.availableRuleResults());
        }
    }
    self.close = function(){
        if($.layer){
            layer.close(self.layerIndex);
        }
        else{
            $('#ruleSelectorDialog').hide(300);
        }
    }

    self.recalculateExclude = function (ruleResult) {
        if (!ruleResult.checked()) {
            return true;
        }
        if (!ruleResult.excludedRuleIds) {
            return true;
        }
        $.each(ruleResult.excludedRuleIds, function (index, excludedId) {
            if (self.availableRuleResults()) {
                $.each(self.availableRuleResults(), function (index, result) {
                    if (result.ruleId == excludedId) {
                        result.checked(false);
                    }
                });
            }
        });
        return true;
    }
}
var ruleSelectorDialog = new RuleSelectorDialog();
$(document).on("koInit", function (event, extraParams) {
    var root = document.getElementById("ruleSelectorDialog");
    if (root) {
        ko.applyBindings(ruleSelectorDialog, root);
    }

});
/*
 $(document).ready(function(){
 ko.applyBindings(ruleSelectorDialog,document.getElementById("ruleSelectorDialog"));
 });*/

