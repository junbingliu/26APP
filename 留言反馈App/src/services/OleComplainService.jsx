//#import pigeon.js
//#import jobs.js

var OleComplainService = (function (pigeon) {
    var objPrefix = "oleComplainServerObj";
    var listPrefix = "oleComplainServerList";

    var f = {
        /**
         *
         * @param jComplaint
         * @param createUserId
         * @returns {*| }
         */
        addComplaint: function (jComplaint, createUserId) {
            var id = f.getNewId();
            var curTime = new Date().getTime();
            jComplaint.id = id;
            jComplaint.createTime = curTime;
            jComplaint.createUserId = createUserId;

            pigeon.saveObject(id, jComplaint);
            f.buildIndex(id);
            var key = f.getKeyByRevertCreateTime(curTime);
            //所有的
            var listId = f.getListName("all");
            var userListId = f.getListName(createUserId);
            pigeon.addToList(listId, key, id);
            pigeon.addToList(userListId, key, id);
            return id;
        },
        /**
         *
         * @param jComplaint
         */
        updateComplaint: function (jComplaint) {
            var id = jComplaint.id;
            pigeon.saveObject(id, jComplaint);
            f.buildIndex(id);
        },
        /**
         * 获得一个投诉对象
         * @param complainId
         * @returns {*|Object}
         */
        getComplaint: function (complainId) {
            return pigeon.getObject(complainId);
        },
        /**
         * 删除
         * @param id
         */
        delComplaint: function (id) {
            var jActive = f.getComplaint(id);
            if (!jActive) {
                return;
            }
            pigeon.saveObject(id, null);
            f.deleteFromComplaintList("all", jActive.createTime, id);
            f.deleteFromComplaintList(jActive.createUserId, jActive.createTime, id);
            f.buildIndex(id);
        },
        /**
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getNewId: function () {
            var idNum = pigeon.getId("oleComplainServerObj");//50000,50001,50002
            return objPrefix + "_" + idNum;//platformFeedbackServerObj_50000
        },
        /**
         * 所有的投诉
         * @returns {string}
         */
        getListName: function (type) {
            return listPrefix + "_complain_" + type;
        },
        /**
         * 辅助方法：按时间倒序排序的key
         * @param dateTime
         * @returns {*}
         */
        getKeyByRevertCreateTime: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            return pigeon.getRevertComparableString(dateTime, 11);//倒序 11111=00000099999
            //return pigeon.getComparableString(dateTime, 11);//升序 11111=00000011111
        },
        /**
         * 重建索引
         * @param id
         */
        buildIndex: function (id) {
            var jobPageId = "services/OleComplainBiuldIndex.jsx";
            JobsService.runNow("oleComplaintApp", jobPageId, {ids: id});
        },
        /**
         * 获取所有投诉总数
         * @returns {*}
         */
        getComplaintListSize: function (type) {
            var listId = f.getListName(type);
            return pigeon.getListSize(listId);
        },
        /**
         * 获取指定数量的投诉
         */
        getComplaintList: function (type, start, limit) {
            var listId = f.getListName(type);
            return pigeon.getListObjects(listId, start, limit);
        },
        deleteFromComplaintList: function (type, createTime, complainId) {
            var listId = f.getListName(type);
            var key = f.getKeyByRevertCreateTime(createTime);
            pigeon.deleteFromList(listId, key, complainId);
        },
        getPigeon: function () {
            return pigeon;
        }

    };
    return f;
})($S);