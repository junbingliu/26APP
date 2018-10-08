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
 * 个人抽奖记录接口
 */
(function () {

        var result = {};
        try {
            var userId = LoginService.getFrontendUserId();//获取当前登录用户id
            if (!userId) {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
                return;
            }
            var jUser = UserService.getUser(userId);
            if (!jUser) {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
                return;
            }
            var lotteryList = LotteryLogService.search(userId);//得到这个用户参与的抽奖活动记录

            if (lotteryList == null || lotteryList.length == 0) {
                H5CommonUtil.setExceptionResult("你还没有参与过活动抽奖!");
                return;
            } else {
                var recordList = [];
                for (var i = 0; i < lotteryList.length; i++) {
                    var jRecord = lotteryList[i];
                    var lottery = {};
                    if (!jRecord) {
                        continue;
                    }
                    lottery.eventId = jRecord.eventId;//活动id
                    lottery.eventName = jRecord.eventName; //活动名称
                    lottery.gradeName = jRecord.gradeName || "无奖品幸运奖";//奖项等级
                    lottery.prizeName = jRecord.prizeName || "无";//奖品名称
                    lottery.verificationCode = jRecord.verificationCode;//验证码
                    var formatCreateTime = "";
                    if (jRecord.createTime && jRecord.createTime != "") {
                        formatCreateTime = DateUtil.getLongDate(jRecord.createTime);
                    }
                    lottery.formatCreateTime = formatCreateTime;//抽奖时间
                    recordList.push(lottery);
                }
                H5CommonUtil.setSuccessResult(recordList);
            }
        }
        catch (e) {
            H5CommonUtil.setExceptionResult("获取个人抽奖记录失败!");
        }
    }
)();