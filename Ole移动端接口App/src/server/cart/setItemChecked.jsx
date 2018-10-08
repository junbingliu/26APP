//#import Util.js
//#import cart.js
//#import session.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;

    var itemId = $.params.itemId;
    var cartId = $.params.cartId;
    var checked = $.params.checked;
    if (checked == 'T' || checked == 't') {
        checked = true;
    } else {
        checked = false;
    }
    if (!cartId || !itemId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var sessionId = SessionService.getSessionId(request);
    try {
        ps20.lock(sessionId);
        var bigCart = CartService.getBigCart();
        CartService.setItemChecked(bigCart, cartId, itemId, checked);
        if (checked) {
            var carts = bigCart.carts;
            var curItem = null;
            for (var k in carts) {
                var cart = carts[k];
                if (cart && cart.items) {
                    for (var k in cart.items) {
                        var item = cart.items[k];
                        if (item.itemId == itemId) {
                            curItem = item;
                        }
                    }
                }
            }
            //CartUtil.checkCartByType(bigCart, curItem.cartType);
            for (var k in carts) {
                var cart = carts[k];
                if (cart && cart.items && cart.cartType != curItem.cartType) {
                    for (var k in cart.items) {
                        var item = cart.items[k];
                        item.checked = false;
                    }
                }
            }

            if (curItem && curItem.temperatureControl) {
                CartUtil.unCheckByTemperatureControl(bigCart, curItem.cartType || curItem.objType, curItem.temperatureControl);//根据温控属性，将购物车全部反选
            }
        }

        CartService.updateBigCart(bigCart);

        var result = CartUtil.getCart();
        if (result.code != ErrorCode.S0A00000.code) {
            ret.code = result.code;
            ret.msg = result.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        ret.data = result.data;//购物车数据
    } catch (e) {
        $.error("设置购物车选中状态失败,请求参数,cartId：" + cartId + ",itemId:" + itemId + ",错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
        return;
    } finally {
        ps20.unlock(sessionId);
    }
    ret.msg = "操作成功";
    out.print(JSON.stringify(ret));
})();