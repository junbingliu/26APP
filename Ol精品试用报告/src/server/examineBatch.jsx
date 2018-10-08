//#import login.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx

/**
 * 审核使用报告
 * @param：
 * @param：
 * @param：
 * @param：
 */
(function () {
    try {
        var examineUserId = $.params["examineUserId"];
        if (!examineUserId) {
            examineUserId = LoginService.getBackEndLoginUserId();
        }
        TrialReportUtil.checkArgument(examineUserId, "管理员没有登录！");

        var id  = $.params["id"] || "";//点赞报告id
        TrialReportUtil.checkArgument(id, "试用报告id不能为空！");

        var examinePassReason =  $.params["examinePassReason"] || "";//审核通过原因


         var examineRejectReasn =  $.params["examineRejectReasn"] || "";//审核通过原因


        var result  = TrialReportUtilService.examine(examineUserId,id);
        ResponseUtil.success(result);
    } catch (e) {
        ResponseUtil.error(e.message);
    }

})();