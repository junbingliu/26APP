//#import doT.min.js
//#import Util.js

(function () {

    var merchantId = $.params["m"];

    var template = $.getProgram(appMd5, "pages/home.jsxp");
    var pageData = {
        merchantId: merchantId
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));

})();

