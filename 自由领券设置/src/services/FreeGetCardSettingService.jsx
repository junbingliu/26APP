//#import pigeon.js
//#import HttpUtil.js

var FreeGetCardSettingService = (function (pigeon) {
    var objPrefix = "freeGetCardSettingObj";
    var listPrefix = "freeGetCardSettingList";

    var f = {
        addGetCardRecord: function (jGetCardRecord, createUserId, merchantId) {
            var id = f.getId();
            var curTime = new Date().getTime();
            jGetCardRecord.id = id;
            jGetCardRecord.merchantId = merchantId;
            jGetCardRecord.createTime = curTime;
            jGetCardRecord.createUserId = createUserId;
            pigeon.saveObject(id, jGetCardRecord);
            var listId = f.getListName(merchantId);
            var key = f.getKeyByRevertCreateTime(curTime);
            pigeon.addToList(listId, key, id);
            return id;
        },
        delGetCardRecord: function (id) {
            var jGetCardRecord = f.getGetCardRecord(id);
            if (!jGetCardRecord) {
                return;
            }
            var merchantId = jGetCardRecord.merchantId;
            var key = f.getKeyByRevertCreateTime(jGetCardRecord.createTime);
            var listId = f.getListName(merchantId);
            pigeon.deleteFromList(listId, key, id);
            pigeon.saveObject(id, null);
        },
        updateGetCardRecord: function (jGetCardRecord) {
            var id = jGetCardRecord.id;
            pigeon.saveObject(id, jGetCardRecord);
        },
        getGetCardRecord: function (id) {
            return pigeon.getObject(id);
        },
        getAllGetCardRecordList: function (merchantId, start, limit) {
            var listId = f.getListName(merchantId);
            return pigeon.getListObjects(listId, start, limit);
        },
        getAllGetCardRecordListSize: function (merchantId) {
            var listId = f.getListName(merchantId);
            return pigeon.getListSize(listId);
        },
        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 11);
        },
        getId: function () {
            var idNum = pigeon.getId("freeGetCardSettingRecord");
            return objPrefix + "_" + idNum;
        },
        getListName: function (merchantId) {
            return listPrefix + "_" + merchantId + "_all";
        }
    };
    return f;
})($S);