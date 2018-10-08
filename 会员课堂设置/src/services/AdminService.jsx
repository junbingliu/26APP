//#import pigeon.js
//#import jobs.js

var AdminService = (function (pigeon) {
    var objPrefix = "oleMemberClassSettingObj";
    var listPrefix = "oleMemberClassSettingList";

    var f = {
        /**
         *
         * @param adminType : 0:平台，1：区域，2：门店
         * @param jAdmin
         * @param createUserId
         * @returns {*|string}
         */
        addAdmin: function (adminType, jAdmin, createUserId) {
            var id = f.getNewId();
            var curTime = new Date().getTime();
            jAdmin.id = id;
            jAdmin.createTime = curTime;
            jAdmin.createUserId = createUserId;
            jAdmin.adminType = adminType;
            pigeon.saveObject(id, jAdmin);

            var listId = f.getListName(adminType);
            var key = f.getPosKey(curTime);
            pigeon.addToList(listId, key, id);
            f.buildIndex(id);
            return id;
        },

        delAdmin: function (id) {
            var jAdmin = f.getAdmin(id);
            if (!jAdmin) {
                return;
            }

            pigeon.saveObject(id, null);

            var key = f.getPosKey(jAdmin.createTime);
            var listId = f.getListName(jAdmin.adminType);
            pigeon.deleteFromList(listId, key, id);
            f.buildIndex(id);
        },
        updateAdmin: function (jAdmin) {
            var id = jAdmin.id;
            pigeon.saveObject(id, jAdmin);
            f.buildIndex(id);
        },
        getAdmin: function (id) {
            var jAdmin = pigeon.getObject(id);
            return jAdmin;
        },
        getAllAdminList: function (adminType, start, limit) {
            var listId = f.getListName(adminType);
            return pigeon.getListObjects(listId, start, limit);
        },
        getAllAdminListSize: function (adminType) {
            var listId = f.getListName(adminType);
            return pigeon.getListSize(listId);
        },

        getPosKey: function (dateTime) {
            dateTime = parseInt(dateTime / 1000);
            var key = pigeon.getRevertComparableString(dateTime, 11);
            return key;
        },
        /**
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getNewId: function () {
            var idNum = pigeon.getId("oleMemberClassSetting_admin");
            return objPrefix + "_admin_" + idNum;
        },
        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function (adminType) {
            return listPrefix + "_adminList_" + adminType;
        },

        buildIndex: function (id) {
            var jobPageId = "services/AdminBuildIndex.jsx";
            JobsService.runNow("oleMemberClassSetting", jobPageId, {ids: id});
        }
    };
    return f;
})($S);