//#import Util.js
//#import product.js
//#import artTemplate3.mini.js
//#import $integralProductManage:services/IntegralRuleService.jsx

(function () {
    var m = $.params["m"];
    var id = $.params["id"];
    var integral_rule = IntegralRuleService.getById(id);
    var cxt = "{attrs:{},factories:[{factory:MF}]}";//市场价
    integral_rule.typeName = IntegralRuleService.getTypeByKey(integral_rule.type);
    var productPrice = ProductService.getPriceValueList(integral_rule.productId, "", integral_rule.merchantId, 1, cxt, "normalPricePolicy");
    integral_rule.marketPrice = productPrice && productPrice[0] && productPrice[0].formatUnitPrice || "暂无价格";
    var source = $.getProgram(appMd5, "pages/product_detail.jsxp");
    var pageData = {
        rule: integral_rule,
        m: m,
        appId: appId
    };
    var render = template.compile(source);
    out.print(render(pageData));
}());