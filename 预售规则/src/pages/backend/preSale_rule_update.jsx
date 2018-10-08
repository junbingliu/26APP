//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var id = $.params['id'];
    var source = $.getProgram(appMd5, "pages/backend/preSale_rule_update.jsxp");
    var rule = PreSaleRuleService.getById(id);
    var render = template.compile(source);
    var pageData = {m: m, preSaleRule: rule};
    out.print(render(pageData));
})();

