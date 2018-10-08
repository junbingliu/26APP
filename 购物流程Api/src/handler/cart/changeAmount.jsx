//#import Util.js
//#import cart.js
//#import login.js

var itemId = $.params.itemId;
var cartId = $.params.cartId;
var toNumber = $.params.toNumber;
var userId = LoginService.getFrontendUserId();

try{
    CartService.changeAmount(cartId,itemId,Number(toNumber),userId);
//#import @handler/cart/getCart.jsx
}
catch(e){
	$.log("\n\n\n\n\n changeAmount error = "+e+" \n\n\n\n\n\n");
    var ret = {
        state:'err',
        msg:e
    }
    out.print(JSON.stringify(ret));
}

