//#import Util.js
//#import doT.min.js
(function () {

    var merchantId = $.params["m"];
    var template = $.getProgram(appMd5, "pages/BatchUpdateProduct.jsxp");
    var pageData = {
        merchantId : merchantId
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

