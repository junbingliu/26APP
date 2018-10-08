//#import Util.js
//#import jobs.js
;
(function () {
    var columnId = "" + ctx.get("columnId");

    //$.log("............................doUpdateColumnToOMS.jsx...begin...columnId=" + columnId);
    var when = (new Date()).getTime() + 2 * 1000;
    var jobPageId = "task/doUpdateColumnToOMS.jsx";
    var postData = {columnId: columnId, action: "Modify"};
    JobsService.submitOmsTask(appId, jobPageId, postData, when);

    //$.log("............................doUpdateColumnToOMS.jsx...end...columnId=" + columnId);
})();









