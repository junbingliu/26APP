//#import Util.js
//#import login.js
//#import DateUtil.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx

;
(function () {
    var m = $.params["m"];
    var result = {};
    try {
        var isOmsExchange = $.params["isOmsExchange"];
        var isEsbExchange = $.params["isEsbExchange"];
        var beginTime = $.params["beginTime"];
        var omsEsbUrl = $.params["omsEsbUrl"] || "";
        var jArgs = OmsControlArgService.getArgs();
        if (!jArgs) {
            jArgs = {};
        }
        if (isOmsExchange) {
            jArgs.isOmsExchange = isOmsExchange;
        }
        if (isEsbExchange) {
            jArgs.isEsbExchange = isEsbExchange;
        }
        jArgs.omsEsbUrl = omsEsbUrl;
        if (beginTime) {
            try {
                if (beginTime) {
                    jArgs.beginTime = DateUtil.getLongTime(beginTime);
                }
            } catch (e) {
                $.log("出现异常："+e);
                result.code = "100";
                result.msg = "日期格式不对";
                out.print(JSON.stringify(result));
                return;
            }
        }
        if(m){
            jArgs.merchantId = m;
        }
        OmsControlArgService.saveArgs(jArgs);

        result.code = "ok";
        result.msg = "保存成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        $.log("..............................ArgsForm_handler.jsx...error=" + e);
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
