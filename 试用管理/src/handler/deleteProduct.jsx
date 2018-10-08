//#import Util.js
//#import $tryOutManage:services/tryOutManageServices.jsx
(function () {
    var id = $.params["id"] || "";
    tryOutManageServices.deletePro(id);
    var data = {
        state:"ok"
    };
    out.print(JSON.stringify(data));
})();