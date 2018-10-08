//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];

    var activeId =  $.params["activeId"];
    var pageData = {
        merchantId: merchantId,
        activeId:activeId
    };
    var template = $.getProgram(appMd5, "pages/trialReportList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();