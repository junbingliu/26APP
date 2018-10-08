//#import Util.js
//#import cart.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx

var itemsString = $.params.items;
var items = JSON.parse(itemsString);


var userId = LoginService.getFrontendUserId();
var bigCart = CartService.getNativeBigCart( false );
var carts = bigCart.optJSONObject("carts");

items.forEach(function(item){
  var smallCart = carts.optJSONObject(item.cartId);
  if(smallCart){
    var jItems = smallCart.optJSONObject("items");
    if(jItems){
      jItems.remove(item.itemId);
    }
  }
});


var userAgent = DssService.getUserAgent( request );
if (userAgent.deviceCategory == "Personal computer") {
  bigCart.put( "buyingDevice", "pc" );
}
else {
  bigCart.put( "buyingDevice", "mobile" );
}
CartService.populatePrices(bigCart,userId,0,false);
CartService.executePlans(bigCart,userId,10*60*1000,true);
CartService.calculateDeliveryRulesForAll(bigCart,userId);
CartApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(bigCart);

var sBigCart = "" + bigCart.toString();
var oBigCart = JSON.parse(sBigCart);


var ret = {
  state:'ok',
  bigCart:oBigCart,
}
out.print(JSON.stringify(ret));