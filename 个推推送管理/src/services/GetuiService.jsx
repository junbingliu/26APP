//#import pigeon.js
//#import Util.js
//#import jobs.js
//#import DateUtil.js

var GetuiService = (function (pigeon) {
    var prefix = "getui";

    var f = {
        addLog: function (merchantId, type, objId, response_code, logContent, requestData, responseData) {
            var logNum = pigeon.getId("getuiLog");
            var logId = prefix + "_Log_" + logNum;
            var curTime = (new Date()).getTime();
            var log = {
                id: logId,
                type: type,
                merchantId: merchantId,
                objId: objId,
                respone_code: response_code,
                isSuccess: response_code == "ok" ? "Y" : "N",
                content: logContent,
                requestData: requestData,//请求报文
                responseData: responseData,//返回报文
                createTime: curTime
            };

            pigeon.saveObject(logId, log);
            var key = pigeon.getRevertComparableString(log.createTime, 13);
            pigeon.addToList(f.getListId(type), key, logId);
            pigeon.addToList(f.getAllListId(), key, logId);

            f.buildIndex(logId);
        },
        getAuthToken: function (type) {
            var id = "getui_auth_token_" + type;
            var obj = pigeon.getObject(id);
            if (!obj) {
                return null;
            }
            var nowTime = new Date().getTime();
            var time = obj.time;
            if (nowTime - time > 24 * 3600 * 1000) {//超过一天不返回
                return null;
            }
            return obj.token;
        },
        saveAuthToken: function (token, time, type) {
            var id = "getui_auth_token_" + type;
            var obj = {
                token: token,
                time: time || new Date().getTime()
            };
            return pigeon.saveObject(id, obj);
        },
        getLog: function (logId) {
            return pigeon.getObject(logId);
        },
        getListId: function (type) {
            return prefix + "_" + type + "_logs";
        },
        getAllListId: function () {
            return prefix + "_logs";
        },
        getLogs: function (type, start, limit) {
            return pigeon.getListObjects(f.getListId(type), start, limit);
        },
        getAllLogs: function (start, limit) {
            return pigeon.getListObjects(f.getAllListId(), start, limit);
        },
        getLogsListSize: function (type) {
            return pigeon.getListSize(f.getListId(type));
        },
        getAllLogsListSize: function () {
            return pigeon.getListSize(f.getAllListId());
        },
        buildIndex: function (id) {
            var jobPageId = "services/GetuiLogBuildIndex.jsx";
            JobsService.runNow("getui", jobPageId, {ids: id});
        },
        getPigeon: function () {
            return pigeon;
        },
        update: function (id, obj) {
            if (!id || !obj) {
                return null;
            }
            pigeon.saveObject(id, obj);
            f.buildIndex(id);
        }
    };
    return f;
})($S);