//#import pigeon.js
//#import Util.js
//#import merchant.js
//#import artTemplate3.mini.js

(function () {
    var source = $.getProgram(appMd5, "pages/include_navbar.jsxp");

    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var pageData = {
        m:m
    };
    var render = template.compile(source);
    out.print(render(pageData));
})();

