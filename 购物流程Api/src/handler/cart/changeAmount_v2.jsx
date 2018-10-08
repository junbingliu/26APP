//#import Util.js
//#import cart.js
//#import login.js

var itemId = $.params.itemId;
var cartId = $.params.cartId;
var toNumber = $.params.toNumber;
var userId = LoginService.getFrontendUserId();

//try{
    CartService.changeAmount(cartId,itemId,Number(toNumber),userId);
//#import @handler/cart/getCart_v2.jsx
//}
//catch(e){
//    var ret = {
//        state:'err',
//        msg:e
//    }
//    out.print(JSON.stringify(ret));
//}

