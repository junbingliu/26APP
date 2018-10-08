//#import login.js
//#import Util.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx

/**
 * 获取试用报告
 *
 * @returns {*}
 */
;(function () {
    try {

        var userId = $.params.userId || ""; // 用户报告id
        if (!userId) {
            userId = LoginService.getFrontendUserId() || "";
        }

        $.log("\n\nUserId = " + userId);

        var id = $.params.id || ""; // 试用报告id

        var activityId = $.params.activityId || ""; // 活动id

        if(activityId && activityId.indexOf("tryOutManage") == -1){
            activityId = "tryOutManage_"+activityId;
        }
        var orderId = $.params.orderId || ""; // 订单id

        var productId = $.params.productId || ""; // 商品id

        var productObjId = $.params.productObjId || ""; // 试用商品id，不是productId

        var keyword = $.params.keyword || "";//关键词 商品名称

        var examineStatus = $.params.examineStatus || "";//审核状态

        var orderBy = $.params.orderBy || "like";//如何排序

        var pageNum = $.params.pageNum || 1;//页码
        var limit = $.params.limit || 10;//每页数量
        var start = (pageNum - 1) * limit;//查询时从何处开始获取

        var params = {
            id: id,
            activityId: activityId,
            orderId: orderId,
            productId: productId,
            productObjId:productObjId,
            keyword: keyword,
            examineStatus: examineStatus
        };

        $.log("\n\n ---> params = " + JSON.stringify(params)+"\n\n");
        var trialReportList = TrialReportUtilService.get(params, orderBy, userId, limit, start);
        for(var g = 0; g < trialReportList.list.length; g++){
            if(trialReportList.list[g] && trialReportList.list[g].userId){
                $.log("userId+++++"+trialReportList.list[g].userId);
                trialReportList.list[g].userInfo = TrialReportUtilService.getUserInfo(trialReportList.list[g].userId)
            }
        }
        ResponseUtil.success(trialReportList);


    } catch (e) {
        ResponseUtil.error(e.message);
    }
})();