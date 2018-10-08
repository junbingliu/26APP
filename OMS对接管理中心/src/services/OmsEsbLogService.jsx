//#import Util.js
//#import pigeon.js
//#import jobs.js

var OmsEsbLogService = (function (pigeon) {
    var prefix = "omsEsbLog";

    var f = {
        addLog: function (type, objId, serviceId, serialNumber, logContent) {
            var logNum = pigeon.getId("crcOmsLog");
            var logId = prefix + "_Log_" + logNum;
            var curTime = (new Date()).getTime();
            var log = {
                id: logId,
                type: type,
                objId: objId,
                serviceId: serviceId,
                serialNumber: serialNumber,
                content: logContent,
                createTime: curTime
            };

            pigeon.saveObject(logId, log);
            var listId = prefix + "_" + type + "_logs";
            var key = pigeon.getRevertComparableString(logNum, 10);
            pigeon.addToList(listId, key, logId);

            f.buildIndex(logId);
        },
        getLog: function (logId) {
            return pigeon.getObject(logId);
        },
        getLogs: function (type, start, limit) {
            var listId = prefix + "_" + type + "_logs";
            return pigeon.getListObjects(listId, start, limit);
        },
        getLogsListSize: function (type) {
            var listId = prefix + "_" + type + "_logs";
            return pigeon.getListSize(listId);
        },
        buildIndex: function (id) {
            var jobPageId = "services/OmsEsbLogBuildIndex.jsx";
            JobsService.runNow("omsEsb_ControlCenter", jobPageId, {ids: id});
        }

    };
    return f;
})($S);