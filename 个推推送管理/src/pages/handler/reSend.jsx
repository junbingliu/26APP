//#import Util.js
//#import $getui:services/GetuiService.jsx
//#import $getui:services/GetuiExchangeUtil.jsx

(function () {
    var id = $.params["id"];
    var ret = {state: 'err', msg: ''};
    if (!id) {
        ret.msg = "ID不能为空";
        out.print(JSON.stringify(ret));
        return;
    }
    var jLog = HRTLogService.getLog(id);
    if (!jLog) {
        ret.msg = "日志为空：" + id;
        out.print(JSON.stringify(ret));
        return;
    }
    var isSuccess = jLog.isSuccess;
    if(isSuccess == "Y"){
        ret.msg = "成功的日志不需要重发：" + id;
        out.print(JSON.stringify(ret));
        return;
    }
    var result = GetuiExchangeUtil.reSend(jLog);
    ret.state = result.state;
    ret.msg = result.msg;
    out.print(JSON.stringify(ret));
})();