//#import Util.js
//#import merchantRights.js
var ruleString = $.params.rule;
var m = $.params.m;
var rule = JSON.parse(ruleString);
if(rule.id){
    MerchantRightsService.saveDispatchRule(rule);
    var result = {state:"ok",id:rule.id};
}
else{
    var id = MerchantRightsService.addDispatchRule(rule);
    var result = {state:"ok",id:id};
}
out.print(JSON.stringify(result));
