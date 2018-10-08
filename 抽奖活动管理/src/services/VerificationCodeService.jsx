//#import Util.js
//#import login.js
//#import pigeon.js
//#import jobs.js
//#import search.js
//#import $lotteryEventManage:services/VerificationCodeQuery.jsx


var VerificationCodeService = (function (pigeon) {
    var objPrefix = "vfCode";
    var listPrefix = "vfCode";

    var f = {
        initObj: function (data) {
            if (!data) data = {};
            var obj = {};
            obj.id = data.id || '';
            obj.vfCode = data.vfCode || '';//验证码
            obj.state = data.state || '';//兑奖状态
            obj.userName = data.userName || '';//用户名
            obj.operator = data.operator || '';//操作人
            obj.eventId = data.eventId || '';//操作人
            obj.eventName = data.eventName || '';//抽奖活动
            obj.useTime = data.useTime || '';//使用时间
            if (!obj.createTime) {
                obj.createTime = new Date().getTime();//创建时间
            }
            var formatCreateTime = "";
            if ( obj.createTime && obj.createTime != "") {
                formatCreateTime = DateUtil.getLongDate(obj.createTime);
            }
            obj.formatCreateTime = formatCreateTime;
            return obj;
        },

        /**
         * 添加
         * @param jUser
         * @param createUserId
         * @returns {*|platformUserServerObj_50000}
         */
        add: function (jUser, createUserId) {
            var id = f.getNewId();
            jUser.id = id;
            jUser = f.initObj(jUser);
            pigeon.saveObject(id, jUser);
            var listId = f.getListName();
            var key = f.getKeyByRevertCreateTime(jUser.createTime);
            var activitiesList = listPrefix+ "_" + jUser.eventId;
            pigeon.addToList(activitiesList, key, id);
            pigeon.addToList(listId, key, id);

            f.buildIndex(id);
            return id;
        },

        getAwardListByActiveId:function(activeId){
            var listName=f.getActiveListName(activeId);
            return listName;
        },
        getActiveListName:function(activeId){
            return listPrefix +"_"+activeId;
        },
        /**
         * 获取list
         * @param start 从多少开始
         * @param limit 取多少条
         * @returns {*}
         */
        getListByName: function (listName,start, limit) {
            return pigeon.getListObjects(listName, start, limit);
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
            var activitiesList = listPrefix+ "_" + jUser.activityTypeId;
            pigeon.deleteFromList(listId, key, id);
            pigeon.deleteFromList(activitiesList, key, id);
            pigeon.saveObject(id, null);
            f.buildIndex(id);
        },

        search:function(userId){
            var isSearch = false;
            var searchParams = {};
            //关键字
            if (userId && userId != "") {
                searchParams.userId = userId;
                isSearch = true;
            }
            var pageLimit =8;

            var listData = [];
            if (isSearch) {
                //进入搜索
                var searchArgs = {
                    fetchCount: 10,
                    fromPath: 0
                };
                searchArgs.sortFields = [{
                    field:"createTime",
                    type:'LONG',
                    reverse:true
                }];

                searchArgs.queryArgs = VerificationCodeQuery.getQueryArgs(searchParams);
                var result = SearchService.search(searchArgs);
                var totalRecords = result.searchResult.getTotal();
                var ids = result.searchResult.getLists();

                for (var i = 0; i < ids.size(); i++) {
                    var objId = ids.get(i);
                    var record = LotteryLogService.get(objId);
                    if (record) {
                        listData.push(record);
                    }
                }
            }
            return listData;
        },

        /**
         *生成随机数
         */
        getRandomCode:function(length){
            var code="";
            for(var i=0;i<length;i++)
                code+=Math.floor(Math.random()*10);
            return code;
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
            var idNum = pigeon.getId("lotteryLog");//50000,50001,50002
            return objPrefix + "_" + idNum;//platformUserServerObj_50000
        },
        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function () {
            return listPrefix + "_all";
        },
        /**
         * 重建索引
         * @param id
         */
        buildIndex: function (id) {
            var jobPageId = "services/VerificationCodeBuildIndex.jsx";
            JobsService.runNow("lotteryEventManage", jobPageId, {ids: id});
        },
        /*
            随机整数
         */
        randomNo:function (minNum,maxNum) {
            switch(arguments.length){
                case 1:
                    return parseInt(Math.random()*minNum+1,10);
                    break;
                case 2:
                    return parseInt(Math.random()*(maxNum-minNum+1)+minNum,10);
                    break;
                default:
                    return 0;
                    break;
            }
        }
    };
    return f;
})($S);