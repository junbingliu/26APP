//#import Util.js
//#import order.js
//#import jobs.js

(function () {

    var orderId = ctx.get("order_id") + "";
    $.log("\n.................................doGiveCardByOrderItemEventForAdd.jsx begin...........orderId="+orderId);

    var jOrder = OrderService.getOrder(orderId);
    if (!jOrder) {
        return;
    }

    var states = jOrder.states;
    if (!states) return;
    var payState = states.payState;
    var processState = states.processState;
    if (!(payState.state == 'p201' && processState.state == 'p101')) {
        return;
    }

    var when = (new Date()).getTime();//马上执行

    //放到异步执行队列
    var jobPageId = "task/DoGiveCardByOrderItemTask.jsx";
    var postData = {orderId: orderId};
    JobsService.submitOrderTask(appId, jobPageId, postData, when);

    $.log("\n.................................doGiveCardByOrderItemEventForAdd.jsx end...........orderId="+orderId);

})();









