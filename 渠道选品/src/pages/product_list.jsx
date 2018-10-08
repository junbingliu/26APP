//#import doT.min.js
//#import Util.js

(function () {
    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var template = $.getProgram(appMd5, "pages/product_list.jsxp");
    var pageData = {
        merchantId: m,
        pMerchantId: "",
        appId: appId
    };

    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();