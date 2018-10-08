//#import pigeon.js
//#import jobs.js

var OleMemberClassService = (function (pigeon) {
    var objPrefix = "memberClassActivityObj";
    var listPrefix = "memberClassActivityList";
    var classObjPrefix="memberClassObj";
    var classListPrefix="memberClassObjList";
    var f = {
        /**
         *
         * @param jActivity
         * @param createUserId
         * @returns {*| }
         */
        addActivity: function (jActivity, createUserId) {
            var id = f.getNewId();
            var curTime = new Date().getTime();
            jActivity.id = id;
            jActivity.createTime = curTime;
            jActivity.createUserId = createUserId;

            pigeon.saveObject(id, jActivity);
            f.buildIndex(id,"activity");
            var key = f.getKeyByRevertCreateTime(curTime);
            //所有的
            var listId = f.getListName("all");
            pigeon.addToList(listId, key, id);
            return id;
        },
        /**
         *
         * @param jClass
         * @param createUserId
         */
        addClass: function (jClass, createUserId) {
            var id = f.getNewClassId();
            var curTime = new Date().getTime();
            jClass.id = id;
            jClass.createTime = curTime;
            jClass.createUserId = createUserId;

            pigeon.saveObject(id, jClass);
            f.buildIndex(id,"class");
            var key = f.getKeyByRevertCreateTime(curTime);
            //所有的
            var listId = f.getClassListName("all");
            pigeon.addToList(listId, key, id);
            return id;
        },
        /**
         *
         * @param jActivity
         */
        updateActivity: function (jActivity) {
            var id = jActivity.id;
            pigeon.saveObject(id, jActivity);
            f.buildIndex(id,"activity");
        },
        updateClass: function (jClass) {
            var id = jClass.id;
            pigeon.saveObject(id, jClass);
            f.buildIndex(id,"class");
        },
        /**
         * 获得一个活动对象
         * @param complainId
         * @returns {*|Object}
         */
        getActivity: function (complainId) {
            return pigeon.getObject(complainId);
        },
        getClass:function(classId){
            return pigeon.getObject(classId);
        },
        /**
         * 删除
         * @param id
         */
        delActivity: function (id) {
            var jActivity = f.getActivity(id);
            if (!jActivity) {
                return;
            }
            pigeon.saveObject(id, null);
            f.deleteFromActivityList("all", jActivity.createTime, id);
            f.buildIndex(id,"activity");
        },
        delClass: function (id) {
            var jClass = f.getClass(id);
            if (!jClass) {
                return;
            }
            pigeon.saveObject(id, null);
            f.deleteFromClassList("all", jClass.createTime, id);
            f.buildIndex(id,"class");
        },
        /**
         * 获得一个唯一的内部id
         * @returns {string}
         */
        getNewId: function () {
            var idNum = pigeon.getId("memberClassActivityObj");//50000,50001,50002
            return objPrefix + "_" + idNum;//memberClassActiveObj_50000
        },
        getNewClassId:function(){
            var idNum = pigeon.getId("memberClassObj");//50000,50001,50002
            return classObjPrefix + "_" + idNum;//memberClassObj_50000
        },
        /**
         * 所有的活动
         * @returns {string}
         */
        getListName: function (type) {
            return listPrefix + "_class_" + type;
        },
        getClassListName:function(type){
            return classListPrefix + "_class_" + type;
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
        buildIndex: function (id,type) {
            var jobPageId = "services/OleMemberClassBiuldIndex.jsx";
            JobsService.runNow("oleMemberClass", jobPageId, {ids: id,bType:type});
        },
        /**
         * 获取所有活动总数
         * @returns {*}
         */
        getActivityListSize: function (type) {
            var listId = f.getListName(type);
            return pigeon.getListSize(listId);
        },
        /**
         * 获取指定数量的活动
         */
        getActivityList: function (type, start, limit) {
            var listId = f.getListName(type);
            return pigeon.getListObjects(listId, start, limit);
        },
        deleteFromActivityList: function (type, createTime, complainId) {
            var listId = f.getListName(type);
            var key = f.getKeyByRevertCreateTime(createTime);
            pigeon.deleteFromList(listId, key, complainId);
        },
        deleteFromClassList: function (type, createTime, id) {
            var listId = f.getClassListName(type);
            var key = f.getKeyByRevertCreateTime(createTime);
            pigeon.deleteFromList(listId, key, id);
        },
        getPigeon: function () {
            return pigeon;
        }

    };
    return f;
})($S);