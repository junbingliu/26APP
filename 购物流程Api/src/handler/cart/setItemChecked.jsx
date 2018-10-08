//#import Util.js
//#import cart.js

var itemId = $.params.itemId;
var cartId = $.params.cartId;
var checked = $.params.checked;
if(checked=='T' || checked=='t'){
    checked = true;
}
else{
    checked = false;
}

var bigCart = CartService.getBigCart();
CartService.setItemChecked(bigCart,cartId,itemId,checked);
CartService.updateBigCart(bigCart);

//#import @handler/cart/getCart.jsx