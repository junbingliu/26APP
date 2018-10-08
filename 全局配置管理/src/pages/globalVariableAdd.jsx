//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var name = $.params["name"];
    var val = $.params["val"];

    var jGlobalVariableInfo={};
    jGlobalVariableInfo.name=name;
    jGlobalVariableInfo.val=val;
    GlobalVariableManagementService.addGlobalVariable(jGlobalVariableInfo);
    response.sendRedirect("globalVariableList.jsx?m="+merchantId);
})();

