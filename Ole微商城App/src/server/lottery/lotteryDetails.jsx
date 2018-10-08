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
 * 活动详情接口
 */
(function () {
    var result = {};
    try {
        var eventId = $.params["eventId"];
        if (!eventId) {
            return;
        }
        var lotteryObj = LotteryEventManageService.get(eventId);//根据活动id获取活动对象
       
        // var startDate=lotteryObj.startDate;
        // var sData= Date.parse(startDate.replace(/-/g,"/"));//转成毫秒数返回
        // lotteryObj.startDate=sData;
        // var endDate=lotteryObj.endDate;
        // var eDate= Date.parse(endDate.replace(/-/g,"/"));//转成毫秒数返回
        // lotteryObj.endDate=eDate;

        var prizeInstructions = lotteryObj.prizeInstructions;
        var prizeInstructionsContext = prizeInstructions.replace(/<(?:.|\s)*?>/g,"");//正则去html标签
        lotteryObj.prizeInstructions=prizeInstructionsContext;
        var prizeSetting = lotteryObj.prizeSetting;
        var prizeSettingContext = prizeSetting.replace(/<(?:.|\s)*?>/g,"");
        lotteryObj.prizeSetting=prizeSettingContext;
        H5CommonUtil.setSuccessResult(lotteryObj);
    } catch (e) {
        H5CommonUtil.setExceptionResult("获取活动详情失败!");
    }
})();