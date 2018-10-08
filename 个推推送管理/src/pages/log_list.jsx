//#import pigeon.js
//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var logType = $.params["type"] || "";
    var logTypeName = $.params["logTypeName"] || "对接日志";

    var pageData = {
        logType: logType,
        logTypeName: logTypeName,
        merchantId: merchantId
    };

    var template = $.getProgram(appMd5, "pages/log_list.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

