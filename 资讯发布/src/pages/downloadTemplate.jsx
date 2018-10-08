//#import doT.min.js
//#import Util.js
(function () {

    var merchantId = $.params["m"];
    var articleId = $.params["articleId"];
    var pageData = {
        merchantId: merchantId,
        articleId:articleId
    };
    var template = $.getProgram(appMd5, "pages/downloadTemplate.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

