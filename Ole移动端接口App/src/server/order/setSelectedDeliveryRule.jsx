//#import Util.js
//#import cart.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var cartId = $.params.cartId;
    var selectedDeliveryRuleId = $.params.ruleId;

    var bigCart = CartService.getBigCart();
    var cart = bigCart.carts[cartId];
    if (cart) {
        cart.selectedDeliveryRuleId = selectedDeliveryRuleId;
        CartService.updateBigCart(bigCart);
    }
    out.print(JSON.stringify(ret));
})();