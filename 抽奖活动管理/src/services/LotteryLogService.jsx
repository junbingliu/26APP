//#import Util.js
//#import login.js
//#import pigeon.js
//#import jobs.js
//#import info.js
//#import search.js
//#import $lotteryEventManage:services/LotteryLogQuery.jsx


var LotteryLogService = (function (pigeon) {
    var objPrefix = "LogObj_";
    var listPrefix = "LogList_";

    var f = {
        initObj: function (data) {
            if (!data) data = {};
            var obj = {};
            obj.id = data.id || '';
            obj.shopId = data.shopId || '';//门店id
            obj.shopName = data.shopName || '';//门店名称
            obj.eventId = data.eventId || '';//抽奖活动id
            obj.eventName = data.eventName || '';//抽奖活动名称
            obj.prizeName = data.prizeName || '';//奖品名称
            obj.activityGrade = data.activityGrade || '';//奖项等级
            obj.gradeName = data.gradeName || '';//奖项等级
            obj.drawNumber = data.drawNumber;//抽奖次数
            obj.status = data.status;//兑奖状态
            obj.verificationCode = data.verificationCode;//验证码
            obj.userId = data.userId || '';//用户id
            obj.userName = data.name || '';//用户名称
            obj.mobile = data.mobile || '';//手机
            obj.cardNo = data.cardno || '';//会员卡号
            obj.address = data.address || '';//地址
            obj.Integral = data.Integral || '';//奖品类型 积分
            obj.CPSCoupon = data.CPSCoupon || '';//奖品类型 cps优惠券id
            obj.cpsCouponName = data.cpsCouponName || '';//奖品类型 cps优惠券名称
            obj.id = data.id || '';
            if (!obj.createTime) {
                obj.createTime = new Date().getTime();
            }
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
            var activitiesList = listPrefix+"_"+jUser.eventId;
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
            f.buildIndex(id);
            var jUser = f.get(id);
            if (!jUser) {
                return;
            }
            var key = f.getKeyByRevertCreateTime(jUser.createTime);
            var listId = f.getListName();
            pigeon.deleteFromList(listId, key, id);
            var activitiesList = listPrefix+ "_" + jUser.eventId;
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
                    fetchCount: 100000,
                    fromPath: 0
                };
                searchArgs.sortFields = [{
                    field:"createTime",
                    type:'LONG',
                    reverse:true
                }];

                searchArgs.queryArgs = LotteryLogQuery.getQueryArgs(searchParams);
                var result = SearchService.search(searchArgs);
                var totalRecords = result.searchResult.getTotal();
                var ids = result.searchResult.getLists();
                for (var i = 0; i < ids.size(); i++) {
                    var objId = ids.get(i);
                    f.buildIndex(objId+"");
                    var record = LotteryLogService.get(objId);
                    if (record) {
                        listData.push(record);
                    }
                }
            }
            return listData;
        },

        searchEventId:function(eventId){
            var isSearch = false;
            var searchParams = {};
            //关键字
            if (eventId && eventId != "") {
                searchParams.eventId = eventId;
                isSearch = true;
            }
            var pageLimit =8;

            var lotteryList = [];
            if (isSearch) {

                //进入搜索
                var searchArgs = {
                    fetchCount: 100000,
                    fromPath: 0
                };
                searchArgs.sortFields = [{
                    field:"createTime",
                    type:'LONG',
                    reverse:true
                }];

                searchArgs.queryArgs = LotteryLogQuery.getQueryArgs(searchParams);
                var result = SearchService.search(searchArgs);
                var totalRecords = result.searchResult.getTotal();
                var ids = result.searchResult.getLists();
                for (var i = 0; i < ids.size(); i++) {
                    var objId = ids.get(i);
                    f.buildIndex(objId+"");
                    var record = LotteryLogService.get(objId);
                    if (record) {
                        lotteryList.push(record);
                    }
                }
            }
            return lotteryList;
        },

        /**
         * 生成随机数
         */
        getRandomCode:function(length){
            var code="";
            for(var i=0;i<length;i++)
                code+=Math.floor(Math.random()*10);
            return code;
        },
        /*
            记录抽奖次数
         */
        setLotteryNumber: function (ua,currentData) {
            var InfoKey = ua + currentData;
            try {
                var LotteryNum = pigeon.getAtom(InfoKey);

                if (LotteryNum >=0) {
                    LotteryNum=LotteryNum+1;
                    pigeon.setAtom(InfoKey, LotteryNum);
                }
                else {
                    pigeon.setAtom(InfoKey, 1);
                }
            }
            catch (e) {
                var LotteryNum = 1;
                pigeon.setAtom(InfoKey, LotteryNum);
            }
        },
        /*
            记录总抽奖次数
         */
        setLotteryTotalNumber: function (eventId,userId) {

            var InfoKey = eventId + userId;
            try {
                var LotteryNum = pigeon.getAtom(InfoKey);

                if (LotteryNum >=0) {
                    LotteryNum=LotteryNum+1;
                    pigeon.setAtom(InfoKey, LotteryNum);
                }
                else {
                    pigeon.setAtom(InfoKey, 1);
                }
            }
            catch (e) {
                var LotteryNum = 1;
                pigeon.setAtom(InfoKey, LotteryNum);
            }
        },
        /*
            获取抽奖次数
         */
        getLotteryNumber: function (InfoKey) {
            try {
                var LotteryNum = pigeon.getAtom(InfoKey);
            }
            catch (e) {
                var LotteryNum = 0;
            }
            return LotteryNum;
        },
        /*
            获取当前日期 格式: 20180308
         */
        getCurrentDate :function(){
            var data = new Date;
            var year = data.getFullYear();
            var month = data.getMonth()+1;
            month =(month<10 ? "0"+month:month);
            var currentDate = data.getDate();
            currentDate =(currentDate<10 ? "0"+currentDate:currentDate);
            var myDate = (year.toString()+month.toString()+currentDate.toString());
            return myDate;
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
            return listPrefix + "_user_all";
        },
        /**
         * 重建索引
         * @param id
         */
        buildIndex: function (id) {
            var jobPageId = "services/LotteryLogBuildIndex.jsx";
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