//#import Util.js
//#import file.js
//#import login.js
//#import product.js
//#import merchant.js
//#import normalBuy.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

;(function () {
    var ret = ErrorCode.S0A00000;
    try {
        var products = $.params.products;
        var spec = $.params.spec || "200X200";
        var uid = LoginService.getFrontendUserId();  //这是顾客的id
        if (uid == "") {
            uid = "-1";
        }
        if (!products) {
            ret = ErrorCode.E1M000000;
            out.print(JSON.stringify(ret));
            return;
        }
        var data = {};
        products = JSON.parse(products);
        var temperatureControl = "";
        for (var i = 0; i < products.length; i++) {
            var jProduct = products[i];
            var productId = jProduct.productId;
            var skuId = jProduct.skuId;
            var amount = jProduct.amount || 1;

            var result = CartUtil.addPreSaleToCart(productId, skuId, amount, uid, spec);
            if (!result || result.code != ErrorCode.S0A00000.code) {
                ret.code = result.code;
                ret.msg = result.msg;
                data[productId] = {code: result.code, msg: result.msg};
            } else {
                data[productId] = {code: result.code, msg: result.msg};
                if (!temperatureControl) {
                    var product = ProductService.getProduct(productId);
                    temperatureControl = product && product.temperatureControl;
                }
            }
        }
        var bigCart = CartService.getBigCart();
        CartUtil.unCheckCartByType(bigCart, "common");//将预售购物车全部不选中
        if(temperatureControl){
            CartUtil.unCheckByTemperatureControl(bigCart, "preSale", temperatureControl);//根据温控属性，将购物车全部反选
        }
        CartService.updateBigCart(bigCart);//保存购物车
        data.count = CartUtil.getCountInCart();
        ret.data = data;
        ret.msg = "加入购物车成功";
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("批量加入购物车异常：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();