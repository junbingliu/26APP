//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import md5Service.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/LoginUtil.jsx
//#import @server/util/UserUtil.jsx

(function () {
    var mobilePhone = $.params.mobilePhone;//手机
    var verificationCode = $.params.validateCode;//短信验证码

    var ret = ErrorCode.S0A00000;
    if (!mobilePhone) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!verificationCode) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
    //只要等于万能验证码，就通过
    if (wnValidateCode && wnValidateCode == verificationCode) {
        //等于万能验证码，直接验证通过
    } else {
        var validatePhone = SessionService.getSessionValue("phoneValidatePhone", request);//接收短信的手机号码
        if (!validatePhone) {
            ret = ErrorCode.user.E1B02019;
            out.print(JSON.stringify(ret));
            return;
        }
        if (validatePhone != mobilePhone) {
            ret = ErrorCode.user.E1B02020;
            out.print(JSON.stringify(ret));
            return;
        }
        var sessionKey = "phoneValidateCode";
        var sendObj = SessionService.getSessionValue(sessionKey, request);//正确短信验证码
        if (!sendObj) {
            ret = ErrorCode.user.E1B02019;
            out.print(JSON.stringify(ret));
            return;
        }
        var inTime = 30 * 60 * 1000;//暂时确定半小时的有效期
        var now = new Date().getTime();
        sendObj = sendObj.split("-");
        var sendTime = sendObj[1];
        var vCode = sendObj[0];
        if (now - inTime > sendTime) {
            ret = ErrorCode.user.E1B02021;
            out.print(JSON.stringify(ret));
            return;
        }
        if (verificationCode != vCode) {
            ret = ErrorCode.user.E1B02022;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var jUserKey = UserService.getUserByKey(mobilePhone);
    if (!jUserKey) {
        ret = ErrorCode.user.E1B02024;
        out.print(JSON.stringify(ret));
        return;
    }
    //如果不是Ole会员，那就当成未注册
    if(!UserUtil.isOleMember(jUserKey)){
        ret = ErrorCode.user.E1B02024;
        out.print(JSON.stringify(ret));
        return;
    }
    var userId = jUserKey.id;//真正用户ID
    if (!userId) {
        ret = ErrorCode.user.E1B02023;
        out.print(JSON.stringify(ret));
        return;
    }
    //登录成功就把验证码失效
    SessionService.removeSessionValue(sessionKey);

    //使用userId登录
    LoginService.loginFrontendByUserId(userId);

    ret.msg = "登录成功";
    ret.data = {
        userId: userId,
        token: LoginUtil.getLoginToken(mobilePhone)
    };
    out.print(JSON.stringify(ret));
})();