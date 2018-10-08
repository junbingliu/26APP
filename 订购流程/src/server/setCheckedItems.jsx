//#import Util.js
//#import cart.js

var d = $.params.d;
var postData = JSON.parse(d);
var bigCart = CartService.getBigCart();
for (cartId in postData) {
    var itemKey = postData[cartId];
    if (typeof itemKey == "string") {
        var itemKeys = itemKey.split(",");
        CartService.checkItems(bigCart, cartId, itemKeys);
    }
}
CartService.updateBigCart(bigCart);

var ret = {
    state: 'ok'
}
out.print(JSON.stringify(ret));