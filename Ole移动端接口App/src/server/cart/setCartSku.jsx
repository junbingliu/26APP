//#import Util.js
//#import cart.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var cartId = $.params.cartId;//购物车id
    var itemId = $.params.itemId;//购物车行id
    var skuId = $.params.skuId;//skuId

    if (!cartId || !itemId || !skuId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    try {
        CartService.setSkuId(cartId, itemId, skuId);
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
        $.error("修改购物车商品sku失败：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();