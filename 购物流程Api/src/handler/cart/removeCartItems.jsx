//#import Util.js
//#import cart.js

var itemsString = $.params.items;
var items = JSON.parse(itemsString);
CartService.removeItems(items);
//#import @handler/cart/getCart.jsx