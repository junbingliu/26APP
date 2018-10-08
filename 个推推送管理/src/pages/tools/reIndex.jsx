//#import Util.js
//#import $getui:services/GetuiService.jsx

(function () {
    var id = $.params['id'];
    if (id) {
        GetuiService.buildIndex(id);
    } else {
        var logList = GetuiService.getAllLogs(0, -1);
        for (var i = 0; i < logList.length; i++) {
            var jLog = logList[i];
            if (!jLog || jLog == "null") {
                continue;
            }
            GetuiService.buildIndex(jLog.id);
        }
        out.print("size:" + logList.length);
    }
})();