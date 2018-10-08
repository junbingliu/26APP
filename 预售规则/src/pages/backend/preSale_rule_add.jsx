//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js

(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var source = $.getProgram(appMd5, "pages/backend/preSale_rule_add.jsxp");
    var pageData = {m: m};
    var render = template.compile(source);
    out.print(render(pageData));
})();

