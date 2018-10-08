//#import Util.js
//#import jobs.js
//#import eventBus.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/BlackListReason.jsx

(function () {
    if (typeof orderId == "undefined" || typeof userId == "undefined"
        || typeof activityId == "undefined" || typeof productId == "undefined") {
        $.log("有参数为空");
        return;
    }
    $.log("\n\n -----> orderId = " + orderId + "\n\n");
    var result = TrialReportUtilService.getTrialReportList({orderId: orderId}, "like", 10, 0);
    $.log("\n\n -----> result.allCount = " + JSON.stringify(result.allCount) + "\n\n");
    //差找不到使用报告，则用户没有在14天内提交试用报告
    if (result.allCount == 0) {
        var inReason = BlackListReason.BLR00001;
        $.log("\n\n -----> enter \n\n");
        BlackListService.add(userId, "system", activityId, productId, orderId,inReason);

        //向个人中心展示接口发送消息关闭提交试用报告入口
    }

})();