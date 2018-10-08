//#import Util.js
//#import pigeon.js
//#import DateUtil.js

var DirectFirstOrderHalfOffLogService = (function (pigeon) {
    var prefix_obj = "DirectFirstOrderHalfOffEventObj";
    var prefix_list = "DirectFirstOrderHalfOffEventList";

    var f = {
        addLog: function (logType, orderId, userId, logContent) {
            var logNum = pigeon.getId("DirectFirstOrderHalfOffEventLog");
            var logId = prefix_obj + "_Log_" + logNum;
            var curTime = (new Date()).getTime();
            var log = {
                id: logId,
                orderId: orderId,
                userId: userId,
                content: logContent,
                createTime: curTime
            };

            pigeon.saveObject(logId, log);
            var listId = prefix_list + "_logs";
            if(logType == "update"){
                listId = prefix_list + "_updateLogs";
            }
            var key = pigeon.getRevertComparableString(logNum, 10);
            pigeon.addToList(listId, key, logId);

        },
        getLog: function (logId) {
            return pigeon.getObject(logId);
        },
        getLogs: function (start, limit) {
            var listId = prefix_list + "_logs";
            return pigeon.getListObjects(listId, start, limit);
        },
        getLogsListSize: function () {
            var listId = prefix_list + "_logs";
            return pigeon.getListSize(listId);
        },
        getUpdateLogs: function (start, limit) {
            var listId = prefix_list + "_updateLogs";
            return pigeon.getListObjects(listId, start, limit);
        },
        getUpdateLogsListSize: function () {
            var listId = prefix_list + "_updateLogs";
            return pigeon.getListSize(listId);
        },
        addUserLog: function (activityId, userId, orderId) {
            var logId = f.getUserLogId(activityId, userId);
            var curTime = (new Date()).getTime();
            var log = {
                id: logId,
                activityId: activityId,
                userId: userId,
                orderId: orderId,
                createTime: curTime
            };

            pigeon.saveObject(logId, log);
        },
        getUserLogId:function(activityId, userId){
            return prefix_obj + "_UserLog_" + activityId + "_" + userId;
        },
        getUserLogById: function (logId) {
            return pigeon.getObject(logId);
        },
        getUserLog: function (activityId, userId) {
            var logId = f.getUserLogId(activityId, userId);
            return pigeon.getObject(logId);
        }
    };
    return f;
})($S);