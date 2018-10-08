//#import pigeon.js
//#import jobs.js
//#import HttpUtil.js

var IDCardLibService = (function (pigeon) {
    var objPrefix = "IDCardLibObj";
    var listPrefix = "IDCardLibList";

    var f = {
        addIdCard: function (jIdCard, createUserId) {
            var id = f.getId(jIdCard.name, jIdCard.idCard);
            var curTime = new Date().getTime();
            jIdCard.id = id;
            jIdCard.createTime = curTime;
            jIdCard.state = "0";//0：身份证照待审核，1：身份证照审核通过 2：身份证照审核不通过
            jIdCard.createUserId = createUserId;
            pigeon.saveObject(id, jIdCard);
            var listId = f.getListName();
            var key = f.getKeyByRevertCreateTime(curTime);
            pigeon.addToList(listId, key, id);
            f.buildIndex(id);
            return id;
        },
        delIdCard: function (id) {
            var jIdCard = f.getIdCard(id);
            if (!jIdCard) {
                return;
            }
            var key = f.getKeyByRevertCreateTime(jIdCard.createTime);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, id);
            pigeon.saveObject(id, null);
            f.buildIndex(id);
        },
        updateIdCard: function (jIdCard) {
            var id = jIdCard.id;
            pigeon.saveObject(id, jIdCard);
            f.buildIndex(id);
        },
        getIdCard: function (id) {
            return pigeon.getObject(id);
        },
        getIdCardByName: function (name, idCard) {
            var id = f.getId(name, idCard);
            return pigeon.getObject(id);
        },
        getAllIdCardList: function (start, limit) {
            var listId = f.getListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        getAllIdCardListSize: function () {
            var listId = f.getListName();
            return pigeon.getListSize(listId);
        },
        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 11);
        },
        getId: function (name, idCard) {
            return objPrefix + "_" + HttpUtils.md5Hex(name + "_" + idCard);
        },
        getListName: function () {
            return listPrefix + "_all";
        },
        buildIndex: function (id) {
            var jobPageId = "services/IDCardLibBuildIndex.jsx";
            JobsService.runNow("IDCardLib", jobPageId, {ids: id});
        }
    };
    return f;
})($S);