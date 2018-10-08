//#import Util.js
//#import user.js
//#import session.js
//#import product.js
//#import HttpUtil.js
//#import sysArgument.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "internalWebUrl");
    var url = webUrl + "/mobile/memberService.html?type=json";

    try {
        var pagaDta = {};
        var data = HttpUtils.postData(url, pagaDta);
        ret.data = data;
        ret.msg = "获取会员服务模板接口成功";
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("获取会员服务模板接口失败,错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();