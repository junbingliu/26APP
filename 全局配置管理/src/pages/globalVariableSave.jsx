//#import doT.min.js
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    var name = $.params["name"];
    var val = $.params["val"];

    var jGlobalVariableInfo={};
    jGlobalVariableInfo.id=id;
    jGlobalVariableInfo.name=name;
    jGlobalVariableInfo.val=val;
    GlobalVariableManagementService.updateGlobalVariable(jGlobalVariableInfo);
    response.sendRedirect("globalVariableList.jsx?m="+merchantId);
})();

