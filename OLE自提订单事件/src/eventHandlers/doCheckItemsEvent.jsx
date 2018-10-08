//#import Util.js
//#import code2product.js
//#import product.js
;
(function () {

    $.log("\n\n........5555555555555555555555............................doCheckItemsEvent.jsx... begin");
    var jOrder = ctx.get("order_object"); //JSONObject
    if (!jOrder) {
        return;
    }


    var merchantId = jOrder.optString("merchantId") + "";
    var orderAliasCode = jOrder.optString("aliasCode") + "";
    var storeMerchantId = jOrder.optString("storeMerchantId");
    $.log("\n........not match.......doCheckItemsEvent.jsx... storeMerchantId1=" + storeMerchantId);

    var isSelfDeliveryOrder = checkIsSelfDeliveryOrder(jOrder);
    $.log("\n........not match.......doCheckItemsEvent.jsx... isSelfDeliveryOrder=" + isSelfDeliveryOrder);
    if(!isSelfDeliveryOrder){
        //不是自提订单，则不继续
        return;
    }

    if (storeMerchantId == null || !storeMerchantId || storeMerchantId == "") {
        //不存在自提门店
        throw "订单存在自提商品，请先选择自提门店";
    }
    storeMerchantId = storeMerchantId + "";
    if (storeMerchantId == merchantId) {
        //订单已经属于目标门店商家，则不继续
        return;
    }

    var items = jOrder.optJSONObject("items");
    if (!items) {
        return;
    }

    var names = $.getNames(items);
    for (var i = 0; i < names.length; i++) {
        var itemId = names[i];
        var jItem = items.optJSONObject(itemId);
        var realSkuId = jItem.optString("realSkuId") + "";
        var name = jItem.optString("name") + "";

        var productId = Code2ProductService.getProductIdByRealSkuId(storeMerchantId, realSkuId);
        if (!productId) {
            $.log("\n........not match.......doCheckItemsEvent.jsx... productId1=" + productId);
            throw name + "在所选自提门店中已下架，请重新选择自提门店";
        }

        var jProduct = ProductService.getProductWithoutPrice(productId);
        if (!jProduct) {
            $.log("\n........not match.......doCheckItemsEvent.jsx... productId2=" + productId);
            throw name + "在所选自提门店中已下架，请重新选择自提门店";
        }
        var publishState = ProductService.getPublishState(jProduct);
        if (publishState != "1") {
            $.log("\n........not match.......doCheckItemsEvent.jsx... productId3=" + productId);
            throw name + "在所选自提门店中已下架，请重新选择自提门店";
        }
    }


    $.log("\n\n........5555555555555555555555............................doCheckItemsEvent.jsx... end");

})();

function checkIsSelfDeliveryOrder(jOrder) {
    var items = jOrder.optJSONObject("items");
    if (items) {
        var names = $.getNames(items);
        for (var i = 0; i < names.length; i++) {
            var itemId = names[i];
            var jItem = items.optJSONObject(itemId);
            var deliveryWay = jItem.optString("deliveryWay") + "";
            $.log("\n........not match.......doCheckItemsEvent.jsx... deliveryWay1=" + deliveryWay);
            if(deliveryWay == "1"){
                //自提商品只能一个购买
                return true;
            }
        }
    }
    return false;
}

