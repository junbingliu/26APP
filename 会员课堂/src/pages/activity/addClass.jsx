//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];

    var pageData = {
        merchantId: merchantId,
        id:id
    };

    var template = $.getProgram(appMd5, "pages/activity/addClass.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

