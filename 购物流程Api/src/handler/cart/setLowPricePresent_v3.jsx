//#import Util.js
//#import cart.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx

var cartId = $.params.cartId;
var itemId = $.params.itemId;
var ruleId = $.params.ruleId;
var selectionStr = $.params.selections;
var selections = JSON.parse(selectionStr);

var userId = LoginService.getFrontendUserId();
var bigCart = CartService.getNativeBigCart(false);
var carts = bigCart.optJSONObject("carts");

var smallCart = carts.optJSONObject(cartId);
var items = smallCart.optJSONObject("items");
var jItem = items.optJSONObject(itemId);

var oCurrent = null;
if (itemId) {
    var oCurrent = jItem;
}
else {
    var oCurrent = smallCart;
}
var presents = [];


var oldPresents = oCurrent.optJSONArray('userSelectedLowPricePresents');

var presents = $.JSONArray([]);
if (oldPresents) {
    /*oldPresents.forEach(function(p){
     if(p.ruleId!=ruleId){
     presents.push(p);
     }
     });*/

    for (var i = 0; i < oldPresents.length(); i++) {
        var p = oldPresents.optJSONObject(i);
        var pRuleId = p.optString("ruleId");
        if (pRuleId != ruleId) {
            presents.put(p);
        }
    }
}


var now = new Date().getTime();
selections.forEach(function (selection) {
    var skuId = selection.skuId;
    var skuIds = selection.skuIds;
    var productId = selection.productId;
    var number = selection.number;

    if (!skuId || skuId == 'null') {
        if (skuIds && skuIds !== "") {
            skuId = skuIds[0];
        } else {
            var headSku = ProductService.getHeadSku(productId);
            skuId = headSku.id;
        }
    }
    if (number > 0) {
        var present = {
            productId: productId,
            ruleId: ruleId,
            skuId: skuId,
            time: now,
            number: number
        }
        var jsonPresent = $.JSONObject(present);
        presents.put(jsonPresent);
    }
});
oCurrent.put('userSelectedLowPricePresents', presents);

var userAgent = DssService.getUserAgent(request);
if (userAgent.deviceCategory == "Personal computer") {
    bigCart.put("buyingDevice", "pc");
}
else {
    bigCart.put("buyingDevice", "mobile");
}
CartService.populatePrices(bigCart, userId, 0, false);
CartService.executePlans(bigCart, userId, 10 * 60 * 1000, true);
CartService.calculateDeliveryRulesForAll(bigCart, userId);
CartApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(bigCart);


var sBigCart = "" + bigCart.toString();
var oBigCart = JSON.parse(sBigCart);


var ret = {
    state: 'ok',
    bigCart: oBigCart,
}
out.print(JSON.stringify(ret));

