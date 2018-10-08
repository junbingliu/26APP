//#import Util.js
//#import cart.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx
//#import $merchantBusinessModeMarking:services/mbmmUtil.jsx

var cartId = $.params.cartId;
var itemId = $.params.itemId;
var ruleId = $.params.ruleId;

var userId = LoginService.getFrontendUserId();
var bigCart = CartService.getNativeBigCart( false );
var carts = bigCart.optJSONObject("carts");

var smallCart = carts.optJSONObject(cartId);
var items = smallCart.optJSONObject("items");
var jItem = items.optJSONObject(itemId);
jItem.put("selectedOrderRuleId",ruleId);


var userAgent = DssService.getUserAgent( request );
if (userAgent.deviceCategory == "Personal computer") {
  bigCart.put( "buyingDevice", "pc" );
}
else {
  bigCart.put( "buyingDevice", "mobile" );
}
CartService.populatePrices(bigCart,userId,0,false);
CartService.executePlans(bigCart,userId,10*60*1000,true);
CartApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(bigCart);

var sBigCart = "" + bigCart.toString();
var oBigCart = JSON.parse(sBigCart);
var cartKeys = Object.keys(oBigCart.carts);
cartKeys.forEach(function (cartId) {
    var cart = oBigCart.carts[cartId];
    var style = mbmmUtil.getBusinessModeByMid(cart.merchantId);
    if(style.businessMode=="自营"||style.businessMode=="亚泰自营") {
        cart.style="亚泰自营";
    }
});

var ret = {
  state:'ok',
  bigCart:oBigCart,
}
out.print(JSON.stringify(ret));