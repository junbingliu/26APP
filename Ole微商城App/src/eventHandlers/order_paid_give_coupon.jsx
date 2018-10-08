//#import Util.js
//#import jobs.js

/**
 * 对于来源是微商城的订单，在支付后，就给它送券，送积分
 */
(function () {
    var javaOrder = ctx.get("order_object");//订单对象

    var jsOrder = JSON.parse(javaOrder + "");
    var orderSource = jsOrder.orderSource;
    //只有来源是微商城的才需要在支付后送积分和券
    if (orderSource == "mobile_iosWeb" || orderSource == "mobile_androidWeb") {
        var postData = {
            orderId: jsOrder.id
        };
        var when = new Date().getTime() + 30 * 1000;//5s之后执行送积分和送券的操作
        JobsService.submitTask(appId, "tasks/order_give_coupon_task.jsx", postData, when);
        $.log("..................order_paid_give_coupon.jsx 订单加入到送积分和券任务成功:" + jsOrder.id);
    }
})();