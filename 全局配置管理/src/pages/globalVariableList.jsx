//#import doT.min.js
//#import Util.js

(function () {
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx
    var merchantId = $.params["m"];
    var searchField = $.params["searchField"];
    var globalVariableList = GlobalVariableManagementService.getAllGlobalVariableList(0,-1);
    var pageData = {
        merchantId: merchantId,
        searchField:searchField || "",
        globalVariableList: globalVariableList
    };
    var template = $.getProgram(appMd5, "pages/globalVariableList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

