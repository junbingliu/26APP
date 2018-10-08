//#import Util.js
//#import session.js

;(function() {
    //特殊验证码，压力测试用
    var specialCaptcha = "111111";
    var state = "true";
    var captcha = $.params.captcha;    //验证码
    if(captcha){
        var sessionCaptcha = SessionService.getSessionValue("ValidateCode", request);
//        SessionService.removeSessionValue("ValidateCode");
        if (captcha != specialCaptcha && (!sessionCaptcha || sessionCaptcha.toLowerCase() != captcha.toLowerCase())) {
            state = "false";
            out.print(state);
            return;
        }
    }else{
        state = "true";
    }
    out.print(state);
})();