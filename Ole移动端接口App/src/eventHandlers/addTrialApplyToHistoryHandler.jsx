
//#import Util.js
//#import jobs.js
;(function () {

    var id = "" + ctx.get("id");
    $.log("\n\n -------->id = " + id + "\n\n");
    var appId = "oleMobileApi";
    var url = "server/productTrial/addTrialApplyToHistory.jsx";
    var taskParams = {
        trialId: id
    };

    $.log("\n\n -------->taskParams = " + JSON.stringify( taskParams) + "\n\n");
    var when = new Date().getTime() + 48 * 60 * 60 * 1000; //1 * 1000;

    JobsService.submitTask(appId, url, taskParams, when);
})();