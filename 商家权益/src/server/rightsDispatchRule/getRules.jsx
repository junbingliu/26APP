//#import Util.js
//#import merchantRights.js
//#import column.js


var rules = MerchantRightsService.getDispatchRules();
$.log(JSON.stringify(rules));
rules.forEach(function(rule){
    if(rule.orgId){
       rule.orgName = ColumnService.getColumnNamePath(rule.orgId,"col_merchant_all","-");
    }
    if(rule.levelId){
        rule.levelName = ColumnService.getColumnNamePath(rule.levelId,"col_merchant_merchantgrade","-");
    }
    if(rule.mainCategoryId){
        rule.mainCategoryName = ColumnService.getColumnNamePath(rule.mainCategoryId,"col_merchant_sort","-");
    }
    if(rule.customCategoryId){
        rule.customCategoryName = ColumnService.getColumnNamePath(rule.customCategoryId,"col_merchant_othersort","-");
    }
    if(rule.templateId){
        var template = MerchantRightsService.getTemplateById(rule.templateId);
        if(template){
            rule.templateName = template.name;
        }
    }
});
var result = {
    state:"ok",
    rules:rules
};
out.print(JSON.stringify(result));

