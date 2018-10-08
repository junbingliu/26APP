//#import Util.js
//#import cart.js
//#import @server/util/CartUtil.jsx
;
(function () {
    var ret = ErrorCode.S0A00000;

    var checked = $.params.checked;
    var cartType = $.params.cartType;
    if (checked == 'T' || checked == 't') {
        checked = true;
    } else {
        checked = false;
    }
    if (!cartType) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    try {
        var bigCart = CartService.getBigCart();
        if (checked) {
            CartService.setAllUnchecked(bigCart);
            CartUtil.checkCartByType(bigCart, cartType);//只选中某种类型的购物车
        } else {
            CartUtil.unCheckCartByType(bigCart, cartType);//不选中某种类型的购物车
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
        $.error("设置购物车选中状态失败,请求参数：" + checked + ",错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
        return;
    }
    ret.msg = "操作成功";
    out.print(JSON.stringify(ret));
})();
