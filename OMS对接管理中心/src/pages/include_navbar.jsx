//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import merchant.js

(function () {
    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var pageData = {
        merchantId:m
    };
    var source = $.getProgram(appMd5, "pages/include_navbar.jsxp");
    var render = doT.template(source);
    out.print(render(pageData));
})();

