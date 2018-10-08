//#import Util.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

(function () {
    var spec = $.params['spec'] || '202X218';//图片规格
    var ret =  ErrorCode.S0A00000;
    try {
        var result = CartUtil.getCart('',spec);
        if (result.code != ErrorCode.S0A00000.code) {
            ret.code = result.code;
            ret.msg = result.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        ret.data = result.data;//购物车数据
        ret.msg = "获取购物车成功";
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("获取购物车失败,错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();