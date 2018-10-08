//#import Util.js
//#import file.js
//#import login.js
//#import product.js
//#import merchant.js
//#import normalBuy.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import $combiproduct:services/CombiProductService.jsx

;(function () {
    var ret2 = ErrorCode.S0A00000;
    try {
        var products = $.params.products;
        var spec = $.params.spec || "200X200";
        var uid = LoginService.getFrontendUserId();  //这是顾客的id
        if (uid == "") {
            uid = "-1";
        }
        if (!products) {
            ret2 = ErrorCode.E1M000000;
            out.print(JSON.stringify(ret2));
            return;
        }
        var data = [];
        products = JSON.parse(products);
        var temperatureControl = "";
        var carType = "common";
        var isAllSuccess = true;
        var isAllFail = true;
        for (var i = 0; i < products.length; i++) {
            var jProduct = products[i];
            var productId = jProduct.productId;
            var skuId = jProduct.skuId;
            var amount = jProduct.amount || 1;

            var result = CartUtil.addToCart(productId, skuId, amount, uid, spec);
            if (!result || result.code != ErrorCode.S0A00000.code) {
                isAllSuccess = false;
                ret2 = result;
                data.push({code: result.code, msg: result.msg, productId: productId});
            } else {
                isAllFail = false;
                data.push({code: result.code, msg: result.msg, productId: productId});
                if (!temperatureControl) {
                    var product = ProductService.getProduct(productId);
                    temperatureControl = product && product.temperatureControl;
                }
                carType = result.cartType;
            }
        }
        var bigCart = CartService.getBigCart();
        if (carType == "common") {
            CartUtil.unCheckCartByType(bigCart, "preSale");//将预售购物车全部不选中
        } else {
            CartUtil.unCheckCartByType(bigCart, "common");//将普通购物车全部不选中
        }
        if (temperatureControl) {
            CartUtil.unCheckByTemperatureControl(bigCart, carType, temperatureControl);//根据温控属性，将购物车全部反选
        }
        CartService.updateBigCart(bigCart);//保存购物车
        ret2.msg = "商品状态异常，仅部分加入购物车成功，请前住购物车查看";
        if (isAllSuccess) {
            ret2.msg = "加入购物车成功,请前住购物车查看";
        }
        if (isAllFail) {
            ret2 = ErrorCode.cart.E1M050105;
            ret2.msg = "商品状态异常，无法加入购物车";
        }
        var data2 = {data: data, count: CartUtil.getCountInCart()};
        ret2.data = data2;
        out.print(JSON.stringify(ret2));
    } catch (e) {
        $.error("批量加入购物车异常：" + e);
        ret2 = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret2));
    }
})();