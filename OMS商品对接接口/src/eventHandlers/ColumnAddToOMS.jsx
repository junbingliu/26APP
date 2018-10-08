//#import Util.js
//#import jobs.js
;
(function () {
    var columnId = "" + ctx.get("columnId");

    //$.log("............................doSendColumnToOMS.jsx...begin...columnId=" + columnId);
    var when = (new Date()).getTime() + 2 * 1000;
    var jobPageId = "task/doUpdateColumnToOMS.jsx";
    var postData = {columnId: columnId, action: "Create"};
    JobsService.submitOmsTask(appId, jobPageId, postData, when);

    //$.log("............................doSendColumnToOMS.jsx...end...columnId=" + columnId);
})();









