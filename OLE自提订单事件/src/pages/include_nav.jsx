//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];

    var pageData = {
        merchantId: merchantId
    };

    var template = $.getProgram(appMd5, "pages/include_nav.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

