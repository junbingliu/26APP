//#import Util.js
//#import cart.js
//#import login.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var productId = $.params.productId;
    var skuId = $.params.skuId;
    var uid = LoginService.getFrontendUserId();
    var amount = $.params.amount || 1;
    var spec = $.params.spec || "200X200";
    try {
        if (!uid || uid == "") {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
        } else {
            var bigCart = CartService.getBigCart();
            var cartItem = CartService.findItem(bigCart, productId, skuId, "common");
            if (!cartItem) {
                CartService.setAllUnchecked(bigCart);//先设置成全部未选中
                CartService.updateBigCart(bigCart);//保存购物车
                //加入购物车
                var result = CartUtil.addToCart(productId, skuId, amount, uid, spec);
                if (result.code != ErrorCode.S0A00000.code) {
                    ret.code = result.code;
                    ret.msg = result.msg;
                    out.print(JSON.stringify(ret));
                    return;
                }
                out.print(JSON.stringify(ret));
            } else {
                CartService.setAllUnchecked(bigCart);//先设置成全部未选中
                cartItem.checked = true;//将当前item设置为选中
                cartItem.amount = amount;
                CartService.updateBigCart(bigCart);//保存购物车
                out.print(JSON.stringify(ret));
            }

        }
    } catch (e) {
        $.error("立即购买加入购物车异常：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();