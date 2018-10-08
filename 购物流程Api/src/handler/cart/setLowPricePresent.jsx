//#import Util.js
//#import product.js
//#import cart.js
var cartId = $.params.cartId;
var itemId = $.params.itemId;
var ruleId = $.params.ruleId;
var selectionStr = $.params.selections;
var selections = JSON.parse(selectionStr);
var cart = CartService.getCart(cartId);
if(itemId){
    var item = cart.items[itemId];
}
else{
    var item = cart;
}

var oldPresents = item['userSelectedLowPricePresents'] || [];
var presents=[];
if(oldPresents){
   oldPresents.forEach(function(p){
        if(p.ruleId!=ruleId){
            presents.push(p);
        }
    });
}

var now = new Date().getTime();
selections.forEach(function(selection){
    var skuId = selection.skuId;
    var productId = selection.productId;
    var number = selection.number;

    if (!skuId || skuId=='null') {
        var headSku = ProductService.getHeadSku(productId);
        skuId = headSku.id;
    }
    var present = {
        productId:productId,
        ruleId:ruleId,
        skuId:skuId,
        time:now,
        number : number
    }
    presents.push(present);
});
item['userSelectedLowPricePresents'] = presents;
CartService.updateCart(cartId,cart);
//#import @handler/cart/getCart.jsx


