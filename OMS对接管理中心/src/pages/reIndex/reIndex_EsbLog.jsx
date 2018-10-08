//#import Util.js
//#import login.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx

(function () {
    var userId = LoginService.getBackEndLoginUserId();
    if (!userId || userId.trim() != "u_0") {
        out.print("noprivilege");
        return;
    }

    var type = $.params["type"];
    if (!type) {
        out.print("type is null");
        return;
    }
    var id = $.params["id"];

    if (!id) {
        //重建索引
        var logList = OmsEsbLogService.getLogs(type, 0, -1);

        var total = 0;
        for (var j = 0; j < logList.length; j++) {
            var jLog = logList[j];

            if (jLog) {
                OmsEsbLogService.buildIndex(jLog.id);
                total++;
            }

        }
        out.print("ok...total=" + total);
    } else {
        OmsEsbLogService.buildIndex(id);
        out.print("ok...id=" + id);
    }



})();