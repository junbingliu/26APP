//#import Util.js
//#import login.js
//#import session.js
//#import sysArgument.js
//#import NoticeTrigger.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var email = $.params['email'];
    var validateCode = $.params['validateCode'] || "8888";
    if (!email || !validateCode) {
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
    var regex_email = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    var emailRegex = new RegExp(regex_email);
    if (!emailRegex.test(email)) {
        ret = ErrorCode.email.E1M080003;
        out.print(JSON.stringify(ret));
        return;
    }
    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
    //只要等于万能验证码，就通过
    if (wnValidateCode && wnValidateCode == validateCode || validateCode) {

    } else {
        //手机端发送短信之前是否需要验证码 与发送短信使用同样的参数控制
        var isNeedValidateCodeForMobileClient = SysArgumentService.getSysArgumentStringValue('head_merchant', 'c_argument_platformKey', 'isNeedValidateCodeForSendSmsMobile');
        if (isNeedValidateCodeForMobileClient == 'true' && !validateCode) {
            ret = ErrorCode.sms.E1M060009;
            out.print(JSON.stringify(ret));
            return;
        }
        if (isNeedValidateCodeForMobileClient == 'true') {
            var sessionValidateCode = SessionService.getSessionValue("ValidateCode", request);
            if (sessionValidateCode != validateCode) {
                ret = ErrorCode.sms.E1M060002;
                out.print(JSON.stringify(ret));
                return;
            }
        }
    }
    var webName = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'webName_cn');//网站名称
    var webUrl = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'webUrl');//网站域名或IP地址

    var randomCode = CommonUtil.getRandomCode();//六位验证码
    var label = {
        "\\[validateCode\\]": randomCode,//验证码
        "\\[user:name\\]": user && user.loginId || "",//收件人
        "\\[validateInfo\\]": randomCode,//验证码
        "\\[sys:webname\\]": webName,//网站名
        "\\[sys:weburl\\]": webUrl//网站路径
    };
    var noticeId = "notice_50100";
    var jResult = NoticeTriggerService.sendNoticeEx(user && user.id || "", email, noticeId, "head_merchant", label);
    if (jResult.state != 'ok') {
        ret = ErrorCode.email.E1M080001;
        out.print(JSON.stringify(ret));
        return;
    }
    var sessionKey = "emailValidateCode";
    var nowTime = new Date().getTime();
    SessionService.addSessionValue(sessionKey, randomCode + "-" + nowTime, request, response);
    SessionService.addSessionValue("validateEmail", email, request, response);
    out.print(JSON.stringify(ret));
})();