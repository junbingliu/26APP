//#import Util.js
//#import jobs.js
;
(function () {

    $.log("\n\n........5555555555555555555555............................doMoveOrderEvent.jsx... begin");
    var order = ctx.get("order_object"); //JSONObject
    if (!order) {
        return;
    }

    var orderId = order.optString("id") + "";

    var postData = {orderId: orderId};
    var when = (new Date()).getTime() + 1000 * 10;
    var jobPageId = "tasks/doMoveOrderTask.jsx";
    JobsService.submitOrderTask(appId, jobPageId, postData, when);

    $.log("\n\n........5555555555555555555555............................doMoveOrderEvent.jsx... end");

})();

