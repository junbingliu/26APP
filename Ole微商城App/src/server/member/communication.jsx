//#import Util.js
//#import pigeon.js
//#import login.js
//#import user.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 沟通方式接口，选择微信或邮件或短信 weixin,email,sms
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
    var type = $.params.type;
    if (!type) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }
    if (type != "weixin" && type != "email" && type != "sms") {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000001, "E1M000110", "类型只能是weixin,email或sms");
        return;
    }
    if (jUser.communicationType && jUser.communicationType != "null") {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003, "E1M000111", "该会员已经有了沟通方式，不能重复保存");
        return;
    }
    var jUser = UserService.getUser(loginUserId);
    if (!jUser) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    jUser.communicationType = type;//修改沟通方式
    UserService.updateUser(jUser, jUser.id);
    H5CommonUtil.setSuccessResult();
})();