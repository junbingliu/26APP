//#import doT.min.js
//#import login.js
//#import Util.js
//#import user.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx

/**
 * 获取试用报告
 * @param id ：必传参数
 * @returns {*}
 */
;(function () {
    try {
        var userId = $.params.userId || ""; // 用户报告id

        var merchantId = $.params.m;

        var id = $.params.id || ""; // 试用报告id

        var activityId = $.params.activeId || ""; // 活动id

        var orderId = $.params.orderId || ""; // 订单id

        var productId = $.params.productId || ""; // 商品id

        var keyword = $.params.keyword || "";//关键词 商品名称

        var examineStatus = $.params.examineStatus || "";//审核状态

        var orderBy = $.params.orderBy || "like";//如何排序

        var pageNum = $.params.page || 1;//页码
        var displayNum = $.params.limit || 10;//每页数量
        var start = (pageNum - 1) * displayNum;//查询时从何处开始获取

        var params = {
            id: id,
            activityId: activityId,
            orderId: orderId,
            productId: productId,
            keyword: keyword,
            examineStatus: examineStatus
        };



        var trialReportList = TrialReportUtilService.get(params, orderBy, userId, displayNum, start);
        var totalPages = (trialReportList.allCount + displayNum - 1) / 10;
        var pageParams = {
            recordType: "试用报告",
            pageLimit: 10,
            displayNum: displayNum,
            totalRecords: trialReportList.allCount,
            totalPages: totalPages,
            currentPage: pageNum
        };

        for(var i = 0; i < trialReportList.list.length; i++){
            var user = UserService.getUser(trialReportList.list[i].userId);
            trialReportList.list[i].userName = "";
            if(user){
                if(user.nickName){
                    trialReportList.list[i].userName = user.nickName;
                }else{
                    trialReportList.list[i].userName = user.loginId;
                }
            }
            var examineInfo = trialReportList.list[i].examineInfo;
            var examineUser = UserService.getUser(trialReportList.list[i].examineInfo.examineUserId);
            examineInfo.examineUser = "";
            if(examineUser){
                if(examineUser.nickName){
                    examineInfo.examineUser = examineUser.nickName;
                }else{
                    examineInfo.examineUser = examineUser.loginId;
                }
            }
        }
        var pageData = {
            merchantId: merchantId,
            pageParams: pageParams,
            resultList: trialReportList
        };
        var template = $.getProgram(appMd5, "pages/load_trialReportList.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print(e.message);
    }
})();