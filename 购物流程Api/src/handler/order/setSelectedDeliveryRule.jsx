//#import Util.js
//#import cart.js

var cartId = $.params.cartId;
var selectedDeliveryRuleId = $.params.dr;

var bigCart = CartService.getBigCart();
var cart = bigCart.carts[cartId];
if (cart) {
    cart.selectedDeliveryRuleId = selectedDeliveryRuleId;
    CartService.updateBigCart(bigCart);
}
//#import @handler/cart/getCart_v3.jsx