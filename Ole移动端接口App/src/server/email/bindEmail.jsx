//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var validateCode = $.params['validateCode'];//验证码
    if (!validateCode) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var user = LoginService.getFrontendUser();//前台登录的用户
    if (!user) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }

    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
    //只要等于万能验证码，就通过
    if (wnValidateCode && wnValidateCode == validateCode) {

    } else {
        var nowTime = new Date().getTime();
        var sessionKey = "emailValidateCode";
        //sessionValidateCode= validateCode + sendTime
        var sessionValidateCode = SessionService.getSessionValue(sessionKey, request);
        var array = sessionValidateCode.split("-");
        if (array.length != 2) {
            ret = ErrorCode.sms.E1M060002;
            out.print(JSON.stringify(ret));
            return;
        }
        var sendTime = array[1];
        if (nowTime - sendTime > 1000 * 60 * 30) {
            SessionService.removeSessionValue(sessionKey);
            ret = ErrorCode.sms.E1M060003;
            out.print(JSON.stringify(ret));
            return;
        }
        if (array[0] != validateCode) {
            ret = ErrorCode.sms.E1M060002;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var validateEmail = SessionService.getSessionValue("validateEmail", request);
    if (!validateEmail) {
        ret = ErrorCode.email.E1M080004;
        out.print(JSON.stringify(ret));
        return;
    }
    if (user.email == validateEmail) {
        ret = ErrorCode.email.E1M080005;
        out.print(JSON.stringify(ret));
        return;
    }
    //解除旧的绑定关系
    if(user.email){
        UserService.removeMemberField(user.email);
    }
    user.email = validateEmail;
    //绑定到新的邮箱
    UserService.addMemberField(validateEmail, user.id, '');
    //保存用户
    UserService.updateUser(user, user.id);
    //删除session里的value
    SessionService.removeSessionValue(sessionKey);
    SessionService.removeSessionValue("validateEmail");

    out.print(JSON.stringify(ret));
})();