//#import login.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx
//#import Util.js
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

        var option = $.params["option"] || "1";//操作报告类型
        TrialReportUtil.checkArgument(option, "操作类型不能为空！");

        var examineReason =  $.params["examineReason"] || "";//审核原因



        var result  = TrialReportUtilService.examineOne(examineUserId,id,option,examineReason);
        ResponseUtil.success(result);
    } catch (e) {
        ResponseUtil.error(e.message);
    }

})();