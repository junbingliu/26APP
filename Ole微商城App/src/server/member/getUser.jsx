//#import Util.js
//#import pigeon.js
//#import login.js
//#import user.js
//#import session.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 获取当前登录的会员相关信息
 */
(function () {
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var jUser = UserService.getUser(loginUserId);
    if (!jUser) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var data = {
        id: jUser.id,
        loginId: jUser.loginId,
        mobile: jUser.mobilPhone,
        cardNo: jUser.cardno,
        memberId: jUser.memberid,
        realName: jUser.realName,
        nickName: jUser.nickName,
        sessionId: SessionService.getSessionId(request)
    };
    H5CommonUtil.setSuccessResult(data);
})();