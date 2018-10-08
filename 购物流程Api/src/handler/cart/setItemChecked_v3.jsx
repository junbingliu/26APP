//#import Util.js
//#import cart.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx

var itemId = $.params.itemId;
var cartId = $.params.cartId;
var checked = $.params.checked;

var userId = LoginService.getFrontendUserId();
var bigCart = CartService.getNativeBigCart( false );
var carts = bigCart.optJSONObject("carts");

var smallCart = carts.optJSONObject(cartId);
var items = smallCart.optJSONObject("items");
var jItem = items.optJSONObject(itemId);
if(checked=='T' || checked=='t'){
  checked = true;
}
else{
  checked = false;
}

jItem.put("checked",checked);

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