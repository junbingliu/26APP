//#import Util.js
//#import jobs.js
//#import order.js
//#import eventBus.js


(function () {
    var getProductId = function (items) {
        var productIds = [];
        for (var key in items) {
            if (items.hasOwnProperty(key)) {
                var jItem = items[key];
                $.log("\n\n ----->jItem.productId = "+jItem.productId + "\n\n");
                 productIds.push (jItem.productId);

            }
        }
        return productIds;
    };

    var orderId = "" + ctx.get("order_id");

    $.log("\n\n----->orderId = "+orderId + "\n\n");

    var orderObj = OrderService.getOrder(orderId);
    if (orderObj.orderType !== "tryuse") {
        return;
    }
    var userId = orderObj.buyerInfo.userId;
    var activityId = orderObj.tryuseActivityId;
    var productId = getProductId(orderObj.items)[0];

    var appId = "oleMobileApi";
    var url = "server/productTrial/checkTrialReportTimeOut.jsx";
    var taskParams = {
        orderId: orderId,
        userId: userId,
        activityId: activityId,
        productId: productId
    };

    $.log("\n\n ----->taskParams = " + taskParams + "\n\n");
    var when = new Date().getTime() + 14 * 24 * 60 * 60 * 1000;// 1 * 1000 ;

    JobsService.submitTask(appId, url, taskParams, when);
})();