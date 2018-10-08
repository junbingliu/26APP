//#import doT.min.js
//#import Util.js
//#import productCategorySelector.js
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx

;
(function () {


    var merchantId = $.params["m"];

    var isEnableRule = "1";
    var jArgs = PreDepositRuleSettingService.getArgs();
    if(jArgs){
        if(jArgs.isEnableRule){
            isEnableRule = jArgs.isEnableRule;
        }
    }

    var template = $.getProgram(appMd5, "pages/ArgsForm.jsxp");
    var pageData = {
        merchantId: merchantId,
        isEnableRule: isEnableRule
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

