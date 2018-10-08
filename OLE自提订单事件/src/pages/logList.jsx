//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var logType = $.params["t"];

    var pageData = {
        merchantId: merchantId,
        logType: logType
    };

    var template = $.getProgram(appMd5, "pages/logList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

