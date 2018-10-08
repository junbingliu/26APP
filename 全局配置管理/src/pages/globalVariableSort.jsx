//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var sortType = $.params["sortType"];
    var searchField = $.params["searchField"];
    var globalVariableList = GlobalVariableManagementService.getAllGlobalVariableList(0,-1);
    globalVariableList.sort(GlobalVariableManagementService.getSortFun(sortType, 'name'));
    var pageData = {
        merchantId: merchantId,
        searchField:searchField || "",
        globalVariableList: globalVariableList
    };
    var template = $.getProgram(appMd5, "pages/globalVariableList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

