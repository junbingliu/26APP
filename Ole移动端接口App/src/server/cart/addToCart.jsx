//#import Util.js
//#import login.js
//#import product.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

;(function () {
    var ret = ErrorCode.S0A00000;
    try {
        var productId = $.params.productId;
        var skuId = $.params.skuId;
        var amount = $.params.amount || 1;
        var uid = LoginService.getFrontendUserId();  //这是顾客的id
        var spec = $.params.spec || "200X200";
        if (uid == "") {
            uid = "-1";
        }
        if (!productId) {
            ret = ErrorCode.E1M000000;
            out.print(JSON.stringify(ret));
            return;
        }
        var result = CartUtil.addToCart(productId, skuId, amount, uid, spec);
        if (!result || result.code != ErrorCode.S0A00000.code) {
            ret.code = result.code;
            ret.msg = result.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        var bigCart = CartService.getBigCart();
        CartUtil.unCheckCartByType(bigCart, "preSale");//将预售购物车全部不选中

        var jProduct = ProductService.getProduct(productId);
        if (jProduct && jProduct.temperatureControl) {
            CartUtil.unCheckByTemperatureControl(bigCart, "common", jProduct.temperatureControl);//根据温控属性，将购物车全部反选
        }
        CartService.updateBigCart(bigCart);//保存购物车
        ret.msg = "加入购物车成功";
        ret.data = {
            count: CartUtil.getCountInCart()
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("加入购物车异常：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();