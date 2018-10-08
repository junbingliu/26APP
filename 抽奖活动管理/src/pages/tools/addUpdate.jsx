//#import Util.js
//#import login.js
//#import base64.js
//#import file.js
//#import $lotteryEventManage:services/LotteryEventManageService.jsx
//#import $lotteryEventManage:services/ActivitiesHenService.jsx

(function () {
    var jRecord={};
    var result = {};
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            result.code = "101";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }

        var jFileInfos = $.uploadFiles("png,jpg", 1024 * 1024 * 10);
        var jFileInfo = jFileInfos[0];
        var jParameters = jFileInfo["parameters"];
        jRecord.id = jParameters.id;

        if (jRecord.id){
            for (var i = 0; i < jFileInfos.length; i++) {
                var fileId = jFileInfos[i].fileId;
                var  filedName= jFileInfos[i].fieldName;
                var jLottery=LotteryEventManageService.get(jRecord.id);
                if (filedName=='Theme') {
                    jLottery.themeImageFileId = fileId;
                    jLottery.themeImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Background') {
                    jLottery.backgroundImageFileId = fileId;
                    jLottery.backgroundImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Turntable') {
                    jLottery.turntableImageFileId = fileId;
                    jLottery.turntableImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Pointer') {
                    jLottery.pointerImageFileId = fileId;
                    jLottery.pointerImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Shopping') {
                    jLottery.goShoppingFileId = fileId;
                    jLottery.goShopping = FileService.getFullPath(fileId);
                }
                if (filedName=='Activity_Rules') {
                    jLottery.activityRulesFileId = fileId;
                    jLottery.activityRules = FileService.getFullPath(fileId);
                }
                if (filedName=='Winning_jRecord') {
                    jLottery.winningjRecordFileId = fileId;
                    jLottery.winningjRecord = FileService.getFullPath(fileId);
                }
                if (filedName=='Share_pictures') {
                    jLottery.shareImageFileId = fileId;
                    jLottery.shareImage = FileService.getFullPath(fileId);
                }if (filedName=='prizeInstructions') {
                    jLottery.prizeInstructionsFileId = fileId;
                    jLottery.prizeInstructionsImage = FileService.getFullPath(fileId);
                }
            }
            jLottery.sweepstakesActivityTypeId = jParameters.Sweepstakes_activity_type;
            jLottery.eventName = jParameters.Event_name || jLottery.eventName ;
            jLottery.winningProbability = jParameters.Winning_probability ||jLottery.winningProbability;
            jLottery.startDate = jParameters.startDate ||jLottery.startDate;
            jLottery.endDate = jParameters.endDate||jLottery.endDate;
            jLottery.activityType = jParameters.type_of_activity ||jLottery.activityType;//活动类型
            jLottery.province = jParameters.Province||jLottery.province;//省
            jLottery.city = jParameters.City||jLottery.city;//市
            jLottery.shopId =jParameters.Village||jLottery.shopId;//门店id
            jLottery.shopName =jParameters.shopName||jLottery.shopName;//门店名
            jLottery.noSmall = jParameters.No_small_lottery_draw||jLottery.noSmall;//无小票抽奖
            jLottery.participationConditions = jParameters.Participation_conditions||jLottery.participationConditions;//参加条件
            jLottery.integral = jParameters.Lottery_credit||jLottery.integral;//积分
            jLottery.lotteryOrderAmount = jParameters.Lottery_order_amount||jLottery.lotteryOrderAmount;//订单金额
            jLottery.goshoppingUrl = jParameters.Go_shopping_url||jLottery.goshoppingUrl;//去购物链接
            jLottery.restrictedPoints = jParameters.restrictedPoints||jLottery.restrictedPoints;//限制积分
            jLottery.lotteryIntegral = jParameters.Lottery_jackpot_credit||jLottery.lotteryIntegral;//奖池积分
            jLottery.lotteryDayNumber = jParameters.Lottery_daily_number||jLottery.lotteryDayNumber;//每日最多抽奖次数
            jLottery.lotteryTotalNumber =jParameters.Lottery_total_number||jLottery.lotteryTotalNumber;//总的最多抽奖次数
            jLottery.prizeInstructions = jParameters.prizeInstructions||jLottery.prizeInstructions;//奖品说明
            jLottery.prizeSetting = jParameters.prizeSetting||jLottery.prizeSetting;//奖项设置
            jLottery.shareTitle = jParameters.Share_title||jLottery.shareTitle;//分享标题
            jLottery.shareIntroduction = jParameters.Share_introduction||jLottery.shareIntroduction;//分享介绍
            jLottery.shareUrl = jParameters.Share_link||jLottery.shareUrl;//分享链接


            LotteryEventManageService.update(jLottery);

        } else {
            for (var i = 0; i < jFileInfos.length; i++) {
                var fileId = jFileInfos[i].fileId;
                var  filedName= jFileInfos[i].fieldName;
                if (filedName=='Theme') {
                    jRecord.themeImageFileId = fileId;
                    jRecord.themeImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Background') {
                    jRecord.backgroundImageFileId = fileId;
                    jRecord.backgroundImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Turntable') {
                    jRecord.turntableImageFileId = fileId;
                    jRecord.turntableImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Pointer') {
                    jRecord.pointerImageFileId = fileId;
                    jRecord.pointerImage = FileService.getFullPath(fileId);
                }
                if (filedName=='Shopping') {
                    jRecord.goShoppingFileId = fileId;
                    jRecord.goShopping = FileService.getFullPath(fileId);
                }
                if (filedName=='Activity_Rules') {
                    jRecord.activityRulesFileId = fileId;
                    jRecord.activityRules = FileService.getFullPath(fileId);
                }
                if (filedName=='Winning_Record') {
                    jRecord.winningRecordFileId = fileId;
                    jRecord.winningRecord = FileService.getFullPath(fileId);
                }
                if (filedName=='Share_pictures') {
                    jRecord.shareImageFileId = fileId;
                    jRecord.shareImage = FileService.getFullPath(fileId);
                }if (filedName=='prizeInstructions') {
                    jRecord.prizeInstructionsFileId = fileId;
                    jRecord.prizeInstructionsImage = FileService.getFullPath(fileId);
                }
            }
            jRecord.sweepstakesActivityTypeId = jParameters.Sweepstakes_activity_type;
            jRecord.eventName = jParameters.Event_name || "";
            jRecord.winningProbability = jParameters.Winning_probability;
            jRecord.startDate = jParameters.startDate;
            jRecord.endDate = jParameters.endDate;
            jRecord.activityType = jParameters.type_of_activity;//活动类型
            jRecord.province = jParameters.Province;//省
            jRecord.city = jParameters.City;//市
            jRecord.shopId =jParameters.Village;//门店id
            jRecord.shopName =jParameters.shopName;//门店名
            jRecord.noSmall = jParameters.No_small_lottery_draw;//无小票抽奖
            jRecord.participationConditions = jParameters.Participation_conditions;//参加条件
            jRecord.integral = jParameters.Lottery_credit;//积分
            jRecord.lotteryOrderAmount = jParameters.Lottery_order_amount;//订单金额
            jRecord.goshoppingUrl = jParameters.Go_shopping_url;//去购物链接
            jRecord.restrictedPoints = jParameters.restrictedPoints;//限制积分
            jRecord.lotteryIntegral = jParameters.Lottery_jackpot_credit;//奖池积分
            jRecord.lotteryDayNumber = jParameters.Lottery_daily_number;//每日最多抽奖次数
            jRecord.lotteryTotalNumber =jParameters.Lottery_total_number;//总的最多抽奖次数
            jRecord.prizeInstructions = jParameters.prizeInstructions;//奖品说明
            jRecord.prizeSetting = jParameters.prizeSetting;//奖项设置
            jRecord.shareTitle = jParameters.Share_title;//分享标题
            jRecord.shareIntroduction = jParameters.Share_introduction;//分享介绍
            jRecord.shareUrl = jParameters.Share_link;//分享链接

            var newId = LotteryEventManageService.add(jRecord, loginUserId);

            var jActivity=ActivitiesHenService.get(jRecord.sweepstakesActivityTypeId);
            jActivity.activityNumber=jActivity.activityNumber+1;
            ActivitiesHenService.update(jActivity);
        }
        result.code = "0";
        result.msg = "操作成功";
        result.newId = newId;
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为："+e;
        out.print(JSON.stringify(result));
    }
})();

