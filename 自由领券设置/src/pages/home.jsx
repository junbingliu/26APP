//#import doT.min.js
//#import Util.js
//#import sysArgument.js

(function () {

    var merchantId = $.params["m"];

    var defaultProjectId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "defaultProjectId");
    if (defaultProjectId == "wushang") {
        response.sendRedirect("RecordList.jsx?m=" + merchantId +"&t=all");
    } else {
        var template = $.getProgram(appMd5, "pages/home.jsxp");
        var pageData = {
            merchantId: merchantId
        };
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    }

})();

