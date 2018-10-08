//#import Util.js
//#import cart.js
//#import @server/util/CartUtil.jsx
;
(function () {
    var ret =  ErrorCode.S0A00000;

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
    try {
        CartService.removeItems(items);

        var result = CartUtil.getCart();
        if (result.code != ErrorCode.S0A00000.code) {
            ret.code = result.code;
            ret.msg = result.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        ret.data = result.data;//购物车数据
    } catch (e) {
        $.error("删除购物车失败,请求参数：" + itemsString + ",错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
        return;
    }
    ret.data.count = CartUtil.getCountInCart();
    ret.msg = "操作成功";
    out.print(JSON.stringify(ret));

})();