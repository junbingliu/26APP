//#import Util.js
//#import cart.js
//#import product.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx
//#import $merchantBusinessModeMarking:services/mbmmUtil.jsx

var bigCart = CartService.getNativeBigCart(false);
try {
    var itemId = $.params.itemId;
    var cartId = $.params.cartId;
    var toNumber = $.params.toNumber;
    var userId = LoginService.getFrontendUserId();

    var t1 = new Date().getTime();

    var t2 = new Date().getTime();
    //$.log("\n\n\n1111111111111\n\n\n\n\n\n");
    var changeResult = CartService.changeCartAmount(bigCart, cartId, itemId, Number(toNumber), userId);
    var t3 = new Date().getTime();
    if (changeResult.code === "100") {
        throw changeResult.msg;
    }
    //$.log("\n\n\n222222222222222222\n\n\n\n\n\n");
    var userAgent = DssService.getUserAgent(request);
    if (userAgent.deviceCategory == "Personal computer") {
        bigCart.put("buyingDevice", "pc");
    }
    else {
        bigCart.put("buyingDevice", "mobile");
    }

    bigCart.put("debug_cartId", cartId);
    bigCart.put("debug_itemId", itemId);
    CartService.upgrade(bigCart);
    CartService.populatePrices(bigCart, userId, 0, false);
    var t4 = new Date().getTime();
    CartService.executePlans(bigCart, userId, 10 * 60 * 1000, true);
    var t5 = new Date().getTime();
    CartService.calculateDeliveryRulesForAll(bigCart, userId);
    CartApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(bigCart);

    var t6 = new Date().getTime();

    var sBigCart = "" + bigCart.toString();
    var oBigCart = JSON.parse(sBigCart);
    var cartKeys = Object.keys(oBigCart.carts);
    cartKeys.forEach(function (cartId) {
        var cart = oBigCart.carts[cartId];
        var style = mbmmUtil.getBusinessModeByMid(cart.merchantId);
        if (style.businessMode == "自营" || style.businessMode == "亚泰自营") {
            cart.style = "亚泰自营";
        }
        var cartItems = cart.items;
        for (var key in cartItems) {
            if (cartItems[key]) {
                selectCombiProductSku(cartItems[key]);
            }
        }
    });
    var t7 = new Date().getTime();
    if (changeResult.code === "101") {
        throw changeResult.msg;
    }

    var ret = {
        state: 'ok',
        bigCart: oBigCart,
        changeAmountTime: t3 - t2,
        getCartTime: t2 - t1,
        populatePricesTime: t4 - t3,
        executePlanTime: t5 - t4,
        updateCartTime: t6 - t5,
        convertTime: t7 - t6,
        totalTime: t7 - t1,
        version: '3'
    }
    out.print(JSON.stringify(ret));
}
catch (e) {
    $.log("\n\n\n\n\n\n error = " + e + " \n\n\n\n\n\n");
    var sBigCart = "" + bigCart.toString();
    var oBigCart = JSON.parse(sBigCart);
    var ret = {
        bigCart: oBigCart,
        state: 'err',
        msg: e + "",
    }
    out.print(JSON.stringify(ret));
}


function selectCombiProductSku(item) {
    if (!item.isCombiProduct || !item.subItems) {
        return;
    }
    item.subItems.forEach(function (subItem) {
        var skus = ProductService.getSkusAndAttrs(subItem.productId);
        $.log("\n\n\n skus = " + JSON.stringify(skus) + " \n\n\n");
        if (subItem.skuId) {
            var newSkus = skus.filter(function (sku) {
                return sku.id === subItem.skuId;
            });
            if (newSkus[0].fullAttrs && newSkus[0].fullAttrs.length > 0) {
                newSkus[0].fullAttrs.sort(function (a, b) {
                    if (a > b) return 1;
                    if (a < b) return -1;
                    return 0;
                });
                subItem.selectSku = newSkus[0].fullAttrs.map(function (attr) {
                    return attr.name
                }).join("");
            } else {
                subItem.selectSku = "默认";
            }
        } else {
            subItem.selectSku = "默认";
        }
    });
}

