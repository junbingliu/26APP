//#import Util.js
//#import cart.js
//#import login.js
//#import pigeon.js
//#import jobs.js
//#import search.js
//#import user.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx

(function(){
		var selfApi = new JavaImporter(
   			 Packages.net.xinshi.isone.modules
   		);
		var productId = $.params.productId;
		var objType = $.params.objType||"";
		var skuId = $.params.skuId;
		var uid = LoginService.getFrontendUserId();
		var amount = $.params.amount || 1;
		if(!uid || uid==""){
			var ret = {state:"101",msg:"请先登录"};
			out.print(JSON.stringify(ret));
		} else {

	    var onceMustBuyCount = selfApi.IsoneModulesEngine.pskuService.getOnceMustBuyCount(productId, skuId);
	    //$.log("\n\n  onceMustBuyCount = "+onceMustBuyCount+" \n\n\n\n");
	    if (Number(onceMustBuyCount) > Number(amount)) {
	    	var ret = {state:"102",msg:"一次最少购买数量为:" + onceMustBuyCount + ",目前购买数量:" + amount};
			out.print(JSON.stringify(ret));
			return;
	    }
	    var bigCart = CartService.getBigCart();
	    var cartItem = CartService.findItem(bigCart,productId,skuId,objType);
	    if(!cartItem){
	        //加入购物车

	        CartService.setAllUnchecked(bigCart);
	        CartService.updateBigCart(bigCart);
//#import @handler/order/addToCart_v3.jsx
		}
		else{
			CartService.setAllUnchecked(bigCart);
			cartItem.checked = true;
			cartItem.amount = amount;
			// cartItem.resellerId = resellerId;
			CartService.updateBigCart(bigCart);
			var ret = {state:"ok",msg:"checked:" + productId};
			out.print(JSON.stringify(ret));
		}

	}
})();

