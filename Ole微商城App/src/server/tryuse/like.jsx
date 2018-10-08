//#import login.js
//#import $oleTrialReport:services/TrialReportService.jsx
//#import @oleTrialReport:utils/ResponseUtils.jsx
//#import @oleTrialReport:utils/TrialReportUtil.jsx
//#import @server/util/H5CommonUtil.jsx
//#import @server/util/ErrorCode.jsx

/**
 * 点赞操作
 * @param：id (试用报告id)：必传参数,注意，这个接口暂时没有用到，用原来oleMobileApp里的接口，是一模一样的
 */
(function () {
    try {
        var userId = LoginService.getFrontendUserId();
        if (!userId) {
            H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
            return
        }
        TrialReportUtil.checkArgument(userId, "用户没有登录！");

        var id = $.params["id"] || "";//点赞报告id
        TrialReportUtil.checkArgument(id, "试用报告id不能为空！");

        var result = TrialReportUtilService.like(userId, id);
        ResponseUtil.success(result);
    } catch (e) {
        ResponseUtil.error(e.message);
    }

})();