//#import Util.js
//#import doT.min.js

(function () {
    var merchantId = $.params["m"];
    var pageData = {
        merchantId: merchantId
    };

    var template = $.getProgram(appMd5, "pages/RecordList_hen.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

