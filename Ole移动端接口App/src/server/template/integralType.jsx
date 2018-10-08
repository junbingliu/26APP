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
    var url = webUrl + "/mobile/integral_classify.html?type=json";

    try {
        var pagaDta = {
            goods_classify:[
                {recordId: "", content: "全部商品", linkTo: "", openInNewPage: "_blank"},
                {recordId: "", content: "全积分兑换礼品", linkTo: "all_integral", openInNewPage: "_blank"},
                {recordId: "", content: "全场代金券", linkTo: "all_coupon ", openInNewPage: "_blank"},
                {recordId: "", content: "积分加钱换购商品", linkTo: "half_integral", openInNewPage: "_blank"},
            ]};
        // var data = HttpUtils.postData(url, pagaDta);
        // ret.data = data;
        ret.data = pagaDta;
        ret.msg = "获取积分商城类别接口成功";
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("获取积分商城类别接口失败,错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();