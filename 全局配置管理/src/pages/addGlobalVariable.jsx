//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var pageData = {
        merchantId: merchantId
    };
    var template = $.getProgram(appMd5, "pages/addGlobalVariable.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

