//#import Util.js
//#import order.js
//#import card.js
//#import OrderLog.js
;
(function () {
    $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....orderId="+orderId);

    var jOrder = OrderService.getOrder(orderId);
    if (!jOrder) {
        $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....1111111111");
        return;
    }

    var states = jOrder.states;
    if (!states) return;
    var processState = states.processState;
    if (processState.state != 'p101') {
        $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....22222");
        return;
    }

    var items = jOrder.items;
    if (!items) {
        $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....33333");
        return;
    }

    var buyerInfo = jOrder.buyerInfo;
    if (!buyerInfo) {
        $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....44444");
        return;
    }

    var buyerUserId = buyerInfo.userId;
    if (!buyerUserId || buyerUserId == "") {
        $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....55555");
        return;
    }

    //todo:验证一下订单是否已经赠送过券
    $.log("\n.......0000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...begin....88888888888888888");
    for (var key in items) {
        var jItem = items[key];

        var cardBatchId = jItem.cardBatchId;
        var amount = jItem.amount;
        $.log("\n...........DoGiveCardByOrderItemTask.jsx...orderId.....=" + orderId);
        $.log("\n...........DoGiveCardByOrderItemTask.jsx...cardBatchId.....=" + cardBatchId);
        $.log("\n...........DoGiveCardByOrderItemTask.jsx...amount.....=" + amount);
        if (cardBatchId && cardBatchId != "") {
            var reason = "卡券商品订单确认自动赠送卡券";//送券原因
            //真正的绑定卡api
            var jResult = CardService.batchBindCards2UserNoPwd(buyerUserId, cardBatchId, amount, reason);
            if (jResult.code == "0") {
                OrderLogService.addErrorLog(orderId, "u_sys", "卡券商品赠送卡券全部成功，卡ID为【" + jResult.success_cardNum + "】");
            } else if (jResult.code == "110") {
                OrderLogService.addErrorLog(orderId, "u_sys", "卡券商品赠送卡券部分成功，成功的卡ID为【" + jResult.success_cardNum + "】，失败的卡ID为【" + jResult.failed_cardNum + "】");
            } else {
                OrderLogService.addErrorLog(orderId, "u_sys", "卡券商品赠送卡券失败，失败原因为【" + jResult.msg + "】");
            }
        }
    }

    $.log("\n.......00000000000000000000000000000000000000000000....DoGiveCardByOrderItemTask.jsx...end....orderId="+orderId);
})();
