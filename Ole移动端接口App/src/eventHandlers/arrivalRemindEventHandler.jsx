//#import product.js
//#import inventory.js
//#import NoticeTrigger.js
//#import $oleMobileApi:services/ArrivalRemindService.jsx

/**
 * 库存修改事件监听器: 当库存发生变化后, 推送消息给订阅过到货通知的用户.
 * @author fuxiao9
 * @date 2017-07-12
 * @email fuxiao9@crv.com.cn
 */

;(function () {
    $.log("\n\n arrivalRemindEventHandler begin \n\n");

    // 注: 从ctx获取的是Java对象, 需要转换成JS对象
    var productId = ctx.get("productId") + ""; // 从触发器参数中获取商品ID
    var skuId = ctx.get("skuId") + ""; // 从触发器参数中获取skuId

    $.log("\n\n arrivalRemindEventHandler productId = " + productId + " \n\n");
    $.log("\n\n arrivalRemindEventHandler skuId = " + skuId + " \n\n");

    // 查询商品可卖数量
    var skuSellAbleCount = 0;
    try {
        skuSellAbleCount = parseInt(InventoryService.getSkuSellableCount(productId, skuId));
    } catch (e) {
        $.log("\n\n arrivalRemindEventHandler sku sell count error : " + e);
        skuSellAbleCount = 0;
    }

    $.log("\n\n arrivalRemindEventHandler sku sell count " + skuSellAbleCount + " \n\n");

    if (skuSellAbleCount > 0) {

        // 根据商品ID及skuId查询到货提醒订阅人
        var subscriberList = ArrivalRemindService.search(productId, skuId);

        $.log("\n\n arrivalRemindEventHandler sub list " + JSON.stringify(subscriberList) + " \n\n");

        if (subscriberList && subscriberList.length > 0) {
            var productInfo = ProductService.getProduct(productId); // 查询商品信息
            subscriberList.forEach(function (arrivalRemind) {

                if (!arrivalRemind) {
                    return true;
                }

                $.log("\n\n send subscription info " + JSON.stringify(arrivalRemind) + " \n\n");

                // 模板参数对象
                var templateParams = {
                    "\\[product:name\\]": productInfo.name,
                    "\\[user:name\\]": arrivalRemind["userName"] || ""
                };

                // 发送短信, notice_51100: 到货通知触发器
                NoticeTriggerService.sendNoticeEx(arrivalRemind.userId, arrivalRemind.telephone, "notice_51100", "head_merchant", templateParams);

                // 删除订阅
                ArrivalRemindService.deleteObject(arrivalRemind.id);
            });
        }
    }
    $.log("\n\n arrivalRemindEventHandler end \n\n");
})();
