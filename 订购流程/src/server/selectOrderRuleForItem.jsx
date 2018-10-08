//#import Util.js
//#import cart.js
var cartId = $.params.cartId;
var itemId = $.params.itemId;
var ruleId = $.params.ruleId;
var bigCart = CartService.getBigCart();

var smallCart = bigCart.carts[cartId];
smallCart.items[itemId].selectedOrderRuleId = ruleId;
CartService.updateBigCart(bigCart);
var ret = {
    state:'ok'
}
out.print(JSON.stringify(ret));