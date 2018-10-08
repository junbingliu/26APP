//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    var jGlobalVariableInfo=GlobalVariableManagementService.getGlobalVariable(id);
    var pageData = {
        merchantId: merchantId,
        jGlobalVariableInfo: jGlobalVariableInfo
    };

    var template = $.getProgram(appMd5, "pages/globalVariableUpdate.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
