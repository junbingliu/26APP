//#import Util.js
//#import user.js
//#import session.js
//#import product.js
//#import HttpUtil.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
(function () {
    var ret = ErrorCode.S0A00000;
    var TemplateId = $.params.TemplateId;
    if (!TemplateId) {
        ret.data = {};
        ret.msg = "参数不能为空";
        out.print(JSON.stringify(ret));
        return
    }

    var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "internalWebUrl");
    var url = webUrl + "/mobile/ole/"+TemplateId+".html?type=json";
    try {
        var pagaDta = {};
        var data = HttpUtils.postData(url, pagaDta);
        ret.data = data;
        ret.msg = "获取专题购接口成功";
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("获取专题购接口,错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();
