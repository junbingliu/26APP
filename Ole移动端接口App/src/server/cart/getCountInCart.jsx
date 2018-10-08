//#import Util.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var merchantId = $.params.merchantId;//商家Id
    var cartType = $.params.cartType;//购物车类型
    try {
        var num = CartUtil.getCountInCart(merchantId, cartType);
        ret.data = {
            count: num + ""
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("获取购物车数量错误：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();