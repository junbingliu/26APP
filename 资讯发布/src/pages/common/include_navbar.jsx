//#import Util.js
//#import doT.min.js

(function () {
    var template = $.getProgram(appMd5, "pages/common/include_navbar.jsxp");

    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var pageData = {
        merchantId:m
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

