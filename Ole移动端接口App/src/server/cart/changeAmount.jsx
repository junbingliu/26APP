//#import Util.js
//#import cart.js
//#import login.js
//#import @server/util/CartUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var itemsString = $.params.items;

    if (!itemsString) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    try {
        var items = JSON.parse(itemsString);
    } catch (e) {
        $.error("解析请求参数失败,请求参数：" + itemsString + ",错误原因:" + e);
        ret = ErrorCode.E1M000001;
        out.print(JSON.stringify(ret));
        return;
    }
    var userId = LoginService.getFrontendUserId();

    try {
        var removeItems = [];
        var firstItemId = "";
        var firstCardId = "";
        for (var i = 0; i < items.length; i++) {
            var jItem = items[i];
            var itemId = jItem.itemId;
            var cartId = jItem.cartId;
            var toNumber = jItem.toNumber;

            if (!itemId || !cartId || !toNumber) {
                continue;
            }
            if (toNumber == 0) {
                removeItems.push({
                    cartId: cartId,
                    itemId: itemId
                });
            } else {
                if (!firstItemId) {
                    firstItemId = itemId;
                    firstCardId = cartId;
                }
                CartService.changeAmount(cartId, itemId, Number(toNumber), userId);
            }
        }
        /*if (firstItemId) {
            var bigCart = CartService.getBigCart();
            var smallCart = bigCart.carts[firstCardId];
            if (smallCart) {
                var jItem = smallCart.items[firstItemId];
                CartUtil.unCheckByTemperatureControl(bigCart, smallCart.cartType, jItem.temperatureControl);//根据温控属性，将购物车全部反选
                CartService.updateBigCart(bigCart);//保存购物车
            }
        }*/
        if (removeItems.length > 0) {
            CartService.removeItems(removeItems);
        }

        var result = CartUtil.getCart();
        if (result.code != ErrorCode.S0A00000.code) {
            ret.code = result.code;
            ret.msg = result.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        ret.data = result.data;//购物车数据
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("修改购物车商品数量异常：" + e);
        ret = ErrorCode.E1M000002;
        ret.msg = e + '';
        out.print(JSON.stringify(ret));
    }

})();