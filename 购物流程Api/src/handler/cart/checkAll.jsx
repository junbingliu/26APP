//#import Util.js
//#import cart.js

var checked = $.params.checked;
if(checked=='T' || checked=='t'){
    checked = true;
}
else{
    checked = false;
}

var bigCart = CartService.getBigCart();
CartService.checkAllCarts(bigCart,checked);
CartService.updateBigCart(bigCart);

//#import @handler/cart/getCart.jsx