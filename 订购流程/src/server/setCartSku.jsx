//#import Util.js
//#import cart.js

var cartId = $.params.cartId;
var itemId = $.params.itemId;
var skuId = $.params.skuId;
CartService.setSkuId(cartId,itemId,skuId);
var ret = {
    state:'ok'
}
out.print(JSON.stringify(ret));