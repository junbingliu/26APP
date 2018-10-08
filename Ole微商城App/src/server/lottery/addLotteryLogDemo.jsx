//#import Util.js
//#import pigeon.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import column.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $lotteryEventManage:services/LotteryLogService.jsx
//#import $lotteryEventManage:services/LotteryEventManageService.jsx
//#import $lotteryEventManage:services/PrizeSettingSomService.jsx

/**
 * 测试
 */
(function () {
    var result = {};


    var activityId = "lem_60000";
    var jActivity = LotteryEventManageService.get(activityId);//活动对象
    var loginUserId = LoginService.getFrontendUserId();//获取当前登录用户id
    var lotteryList = LotteryLogService.search(activityId);//得到这个用户参与的抽奖活动记录

    try {
        var jRecord = {};
        if (!lotteryList) {
            return;
        }
        var a = 1;
        for (var i = 0; i < lotteryList.length; i++) {
            var jRecord = lotteryList[i];
            var b = jRecord.drawNumber;
            a = a + b;
        }

        out.print(JSON.stringify(a));

        //jRecord.shopId = jActivity.shopId;//门店id
        // jRecord.shopName = jActivity.shopName;//门店名称
        jRecord.eventId = jActivity.id;//活动id
        jRecord.eventName = jActivity.eventName;//活动名称
        jRecord.drawNumber = a;//活动名称
        jRecord.status = 1;
        var random = LotteryLogService.getRandomCode(15);//获取验证码
        jRecord.verificationCode = random;
        out.print(JSON.stringify(jRecord));

        var newId = LotteryLogService.add(jRecord, loginUserId);
        result.code = "0";
        result.msg = "操作成功";
        result.newId = newId;
        out.print(JSON.stringify(result));
    } catch (e) {
        result.code = "110";
        result.msg = "操作出现异常，异常信息为：" + e;
        out.print(JSON.stringify(result));
    }

})();