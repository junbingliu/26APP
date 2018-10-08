//#import Util.js
//#import $limitBuy:services/limitBuyService.jsx
(function () {
    var jOrder = ctx.get("order_object");
    var jItems = jOrder.optJSONObject("items");
    var names = jItems.getNames(jItems);
    if (!names) {
        return;
    }
    for (var i = 0; i < names.length; i++) {
        var name = names[i];
        var jTempItem = jItems.get(name);
        var productId = "" + jTempItem.optString('productId');
        var config = LimitBuyService.getConfig(productId);
        if (config) {
            var toNumber = Number(jTempItem.optString("amount") + "");
            var productName = "" + jTempItem.optString("name");
            if (config.minNumber && toNumber < config.minNumber && config.minNumber != -1) {
                throw "商品:" + productName + "最少购买" + config.minNumber + "个";
            }

            if (config.maxNumber && toNumber > config.maxNumber && config.maxNumber != -1) {
                throw "商品:" + productName + "最多购买" + config.maxNumber + "个";
            }
        }
    }
})();
