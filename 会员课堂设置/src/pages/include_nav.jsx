//#import doT.min.js
//#import Util.js

(function () {
    var orderAliasCode = $.params["m"];

    var pageData = {
        merchantId: orderAliasCode
    };

    var template = $.getProgram(appMd5, "pages/include_nav.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

