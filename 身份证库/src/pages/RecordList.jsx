//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var t = $.params["t"] || "all";
    var pageData = {
        merchantId: merchantId,
        t: t
    };

    var template = $.getProgram(appMd5, "pages/RecordList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

