(function () {
//#import Util.js
//#import log.js

    var merchantId = $.params["m"];
    var logId = $.params["logId"];

    var jLog = LogService.getExecuteTimeLog(logId);

    var logs = jLog.logs;
    if (!logs || logs.leng == 0) {
        out.print("正在处理中...");
        return;
    }
    for (var i = 0; i < logs.length; i++) {
        out.print(logs[i]);
        out.print("<br><br>");
    }
})();

