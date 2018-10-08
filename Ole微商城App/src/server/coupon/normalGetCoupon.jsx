//#import Util.js
//#import pigeon.js
//#import login.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
//#import $freeGetCardControl:services/FreeGetCardUtil.jsx

/**
 * 普通领券活动，先判断有没有登录，没有登录，则要跳转到登录页面，这个判断在前端做
 */
(function () {
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var activityId = $.params.activityId;//领券活动id

    if (!activityId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    var jResult1 = FreeGetCardUtil.doGiveCard(loginUserId, activityId, "");//给会员绑定券

    if (jResult1.code == "0") {
        H5CommonUtil.setSuccessResult();
    } else {
        H5CommonUtil.setExceptionResult(jResult1.msg);
    }
})();