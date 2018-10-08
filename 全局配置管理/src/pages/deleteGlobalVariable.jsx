(function () {
//#import Util.js
//#import $GlobalVariableManagementApp:services/globalVariableManagementService.jsx

    var merchantId = $.params["m"];
    var id = $.params["id"];
    GlobalVariableManagementService.deleteGlobalVariable(id);
    response.sendRedirect("globalVariableList.jsx?m="+merchantId);
})();

