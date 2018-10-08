//#import Util.js
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 根据id获取试用报告提示语内容
 */
(function () {
    var id = $.params["id"];
    var obj = tryOutManageServices.getById(id);
    out.print(JSON.stringify(obj));
})();