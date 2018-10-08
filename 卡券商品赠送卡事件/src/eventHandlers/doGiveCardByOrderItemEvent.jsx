//#import Util.js
//#import jobs.js

(function () {

    var orderId = ctx.get("order_id") + "";
    $.log("\n.................................doGiveCardByOrderItemEvent.jsx begin...........orderId="+orderId);

    var when = (new Date()).getTime();//马上执行

    //放到异步执行队列
    var jobPageId = "task/DoGiveCardByOrderItemTask.jsx";
    var postData = {orderId: orderId};
    JobsService.submitOrderTask(appId, jobPageId, postData, when);

    $.log("\n.................................doGiveCardByOrderItemEvent.jsx end...........orderId="+orderId);

})();









