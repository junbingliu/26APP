//#import pigeon.js
//#import jobs.js

var PrizeSettingSomService = (function (pigeon) {
    var objPrefix = "Prize_Obj";
    var listPrefix = "Prize_List";

    var f = {
        initObj: function (data) {
            if (!data) data = {};
            var obj = {};
            obj.id = data.id || '';
            obj.activityTypeId = data.Sweepstakes_activity_type ||  data.activityTypeId || '';//抽奖活动类型Id
            obj.activityTypeName = data.activityTypeName || data.activityTypeName || '';//抽奖活动类型名称
            obj.prizeName = data.Activity_name || data.prizeName || '';//奖品名称
            obj.uploadImage = data.upload_image || data.uploadImage || '';//上传图片
            obj.startingAngle = data.Starting_angle || data.startingAngle || '';//开始角度
            obj.endAngle = data.End_angle || data.endAngle || '';//结束角度
            obj.prizeNumber = data.Prize_number || data.prizeNumber || '';//奖品数量
            obj.maximumNumberPrizes = data.Maximum_number_prizes || data.maximumNumberPrizes || '';//每日最大放奖数量
            obj.remainAmount = data.remainAmount || data.Prize_number || data.remainAmount || '';//剩余数量
            obj.activityGrade = data.Activity_grade || data.activityGrade || '';//等级id
            obj.gradeName = data.gradeName || data.gradeName || '';//等级名称
            obj.awardNotice = data.Award_notice || data.awardNotice || '';//奖项通知
            obj.frontEndDisplayInformation = data.Front_end_display_information || data.frontEndDisplayInformation || '';//前端显示信息
            obj.prizeTime = data.Prize_time || data.prizeTime || '';//放奖时间
            obj.prizeType = data.Prize_type || data.prizeType || '';//奖品类型
            obj.integral = data.integral || data.integral || '';//积分
            obj.integralMultiples = data.Integral_multiples || data.integralMultiples || '';//积分倍数
            obj.VIPCoupon = data.VIP_coupon || data.VIPCoupon || '';//VIP优惠券
            obj.vipCouponName = data.vipCouponName || data.vipCouponName || '';//VIP优惠券
            obj.CPSCoupon = data.CPS_coupon || data.CPSCoupon || '';//cps优惠券
            obj.cpsCouponName = data.cpsCouponName || data.cpsCouponName || '';//cps优惠券名称
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
            jUser.id=id;
            jUser = f.initObj(jUser);
            pigeon.saveObject(id, jUser);
            var listId = f.getListName();
            var key = f.getKeyByRevertCreateTime(jUser.createTime);

            var activitiesList = listPrefix+ "_" + jUser.activityTypeId;
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
        getAllUserListObj: function (start, limit) {
            var listId = f.getListNameObj();
            return pigeon.getListObjects(listId, start, limit);
        },

        getListNameObj: function (avitiv) {
            return avitiv;
        },

        /**
         * 对象列表名称
         * @returns {string}
         */
        getListName: function () {
            return listPrefix + "_all";
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
            var idNum = pigeon.getId("Prize");//50000,50001,50002
            return objPrefix + "_" + idNum;//platformUserServerObj_50000
        },

        /**
         * 重建索引
         * @param id
         */
        buildIndex: function (id) {
            var jobPageId = "services/PrizeSettingSomBuildIndex.jsx";
            JobsService.runNow("lotteryEventManage", jobPageId, {ids: id});
        }
    };
    return f;
})($S);