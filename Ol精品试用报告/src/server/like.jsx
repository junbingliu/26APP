//#import login.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx

/**
 * 点赞操作
 * @param：id (试用报告id)：必传参数
 */
(function () {
    try {
        var userId = $.params["userId"];
        if (!userId) {
            userId = LoginService.getFrontendUserId();
        }
        TrialReportUtil.checkArgument(userId, "用户没有登录！");

        var id  = $.params["id"] || "";//点赞报告id
        TrialReportUtil.checkArgument(id, "试用报告id不能为空！");

        var result  = TrialReportUtilService.like(userId,id);
        ResponseUtil.success(result);
    } catch (e) {
        ResponseUtil.error(e.message);
    }

})();