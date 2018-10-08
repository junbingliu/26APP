//#import pigeon.js
//#import jobs.js

var LotteryEventManageService = (function (pigeon) {
    var objPrefix = "lem";
    var listPrefix = "lem";

    var f = {
        initObj: function (data) {
            if (!data) data = {};
            var obj = {};
            obj.id = data.id || '';
            obj.themeImageFileId = data.themeImageFileId || ''; //主题图片
            obj.backgroundImageFileId = data.backgroundImageFileId || '';//背景图片
            obj.turntableImageFileId = data.turntableImageFileId || '';//
            obj.pointerImageFileId = data.pointerImageFileId || '';
            obj.goShoppingFileId = data.goShoppingFileId || '';
            obj.activityRulesFileId = data.activityRulesFileId || '';
            obj.winningRecordFileId = data.winningjRecordFileId || '';
            obj.winningRecordFileId = data.winningjRecordFileId || '';
            obj.shareImageFileId = data.shareImageFileId || '';
            obj.sweepstakesActivityTypeId = data.Sweepstakes_activity_type || data.sweepstakesActivityTypeId ||'';//抽奖活动类型id
            obj.eventName = data.Event_name || data.eventName || '';//Event_name
            obj.winningProbability = data.Winning_probability || data.winningProbability || '';//中奖概率
            obj.startDate = data.startDate || data.startDate || '';//开始时间
            obj.endDate = data.endDate || data.endDate || '';//结束时间
            obj.activityType = data.type_of_activity || data.activityType || '';//活动类型
            obj.province = data.Province || data.province || '';//省
            obj.city = data.City || data.city || '';//市
            obj.shopId = data.Village || data.shopId || '';//门店id
            obj.shopName = data.shopName ||  '';//门店名
            obj.noSmall = data.No_small_lottery_draw || data.noSmall || '';//无小票抽奖

            obj.participationConditions = data.Participation_conditions || data.participationConditions ||  '';//参加条件
            obj.integral = data.Lottery_credit || data.integral ||  '';//积分
            obj.lotteryOrderAmount = data.Lottery_order_amount || data.lotteryOrderAmount ||  '';//订单金额
            obj.themeImage = data.Theme || data.themeImage ||  '';//主题图片
            obj.backgroundImage = data.Background || data.backgroundImage ||  '';//背景图片
            obj.turntableImage = data.Turntable || data.turntableImage ||  '';//转盘图片
            obj.pointerImage = data.Pointer || data.pointerImage ||  '';//指针图片
            obj.winners = data.winners || data.winners ||  0;//中奖人数
            obj.participants = data.participants || data.participants || 0;//参与人数
            obj.goShopping = data.Shopping || data.goShopping ||  '';//按钮(去购物)
            obj.goshoppingUrl = data.Go_shopping_url || data.goshoppingUrl ||  '';//去购物链接
            obj.activityRules = data.Activity_Rules || data.activityRules ||  '';//按钮（活动规则）
            obj.winningRecord = data.Winning_Record || data.winningRecord ||  '';//按钮（中奖记录）
            obj.restrictedPoints = data.restrictedPoints || data.restrictedPoints ||  '';//限制积分
            obj.lotteryIntegral = data.Lottery_jackpot_credit || data.lotteryIntegral ||  '';//奖池积分
            obj.lotteryDayNumber = data.Lottery_daily_number || data.lotteryDayNumber ||  '';//每日最多抽奖次数
            obj.lotteryTotalNumber = data.Lottery_total_number || data.lotteryTotalNumber || '';//总的最多抽奖次数
            obj.prizeInstructions = data.prizeInstructions ||  '';//奖品说明
            obj.prizeSetting = data.prizeSetting ||  '';//奖项设置
            obj.shareTitle = data.Share_title || data.shareTitle ||  '';//分享标题
            obj.shareIntroduction = data.Share_introduction || data.shareIntroduction ||  '';//分享介绍
            obj.shareUrl = data.Share_link || data.shareUrl ||  '';//分享链接
            obj.shareImage = data.Share_pictures || data.shareImage || '';//分享图片
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
            pigeon.addToList(listId, key, id);
            f.buildIndex(id);
            return id;
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
         * 修改
         * @param jUser
         */
        update: function (jUser) {
            var id = jUser.id;
            jUser.id=id;
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
            var idNum = pigeon.getId("lotteryManage");//50000,50001,50002
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
            var jobPageId = "services/LotteryEventManageBuildIndex.jsx";
            JobsService.runNow("lotteryEventManage", jobPageId, {ids: id});
        }
    };
    return f;
})($S);