//#import pigeon.js
//#import jobs.js

var ActivitiesHenService = (function (pigeon) {
    var objPrefix = "ati";
    var listPrefix = "ati";

    var f = {

        initObj: function (data) {
            if (!data) data = {};
            var obj = {};
            obj.id = data.id || '';
            obj.title = data.title || '';//活动类型名称
            obj.activityNumber = data.activityNumber || 0;//活动数量
            if (!obj.createTime) {
                obj.createTime = new Date().getTime();
            }
            return obj;
        },
        /**
         * 添加
         * @param jUser
         * @param createUserId
         * @returns
         */
        add: function (jUser, createUserId) {
            var id = f.getNewId();
            jUser.id = id;
            jUser = f.initObj(jUser);
            pigeon.saveObject(id, jUser);
            var listId = f.getListName();
            var key = f.getKeyByRevertCreateTime(jUser.createTime);
            pigeon.addToList(listId, key, id);
            f.buildIndex(id);
            return id;
        },
        /**
         * 修改
         * @param jUser
         */
        update: function (jUser) {
            var id = jUser.id;
            jUser.id = id;
            jUser = f.initObj(jUser);
            pigeon.saveObject(id, jUser);
            f.buildIndex(id);
        },

        /**
         * 删除
         * @param id
         */
        del: function (id) {
            var jUser = f.get(id);
            if (!jUser) {
                return;
            }

            var key = f.getKeyByRevertCreateTime(jUser.createTime);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, id);
            pigeon.saveObject(id, null);
            f.buildIndex(id);
        },

        /**
         * 获得一个User对象
         * @param id
         * @returns {*|Object}
         */
        get: function (id) {
            return pigeon.getObject(id);
        },
        /**
         * 获取指定数量的User对象
         * @param start
         * @param limit
         * @returns {*}
         */
        getAllList: function (start, limit) {
            var listId = f.getListName();
            return pigeon.getListObjects(listId, start, limit);
        },
        /**
         * 获取总数
         * @returns {*}
         */
        getAllListSize: function () {
            var listId = f.getListName();
            return pigeon.getListSize(listId);
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
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getNewId: function () {
            var idNum = pigeon.getId("activities");//50000,50001,50002
            return objPrefix + "_" + idNum;//platformUserServerObj_50000
        },
        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function () {
            //抽奖活动Id L_EObj_50087
            //{id ,activiteId,levelId,name,amount,
            //抽奖活动对应的奖项列表， 活动id+"_"+"award_list"

            return listPrefix + "_all";
        },
        /**
         * 重建索引
         * @param id
         */
        buildIndex: function (id) {
            var jobPageId = "services/ActivitiesHenBuildIndex.jsx";
            JobsService.runNow("lotteryEventManage", jobPageId, {ids: id});
        }
    };
    return f;
})($S);