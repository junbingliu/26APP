//#import Util.js
//#import login.js
//#import file.js
//#import $tryOutManage:services/tryOutManageServices.jsx
/**
 * 通过活动id获取活动内容
 */
(function () {
   var activeId = $.params["activeId"] || "";
    var obj = tryOutManageServices.getById(activeId);
    out.print(JSON.stringify(obj));
})();