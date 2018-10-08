//#import Util.js
//#import pigeon.js
//#import session.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx

(function () {
    //这个是发送短信的接口
    var ret = ErrorCode.S0A00000;
    var smsValidatingCode = $.params['phoneValidatingCode'];//验证码
    var phone = $.params['phoneNumber'];//手机号码
    if (!phone || !smsValidatingCode) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
    //只要等于万能验证码，就通过
    if (wnValidateCode && wnValidateCode == smsValidatingCode) {
        out.print(JSON.stringify(ret));
        return;
    }
    var sessionKey = "phoneValidateCode";
    var sessionValidateCode = SessionService.getSessionValue(sessionKey, request);
    if (!sessionValidateCode) {
        ret = ErrorCode.sms.E1M060001;
        out.print(JSON.stringify(ret));
        return;
    }
    var validatePhone = SessionService.getSessionValue("phoneValidatePhone",request);//接收短信的手机号码
    if(validatePhone != phone){
        ret = ErrorCode.sms.E1M060014;
        out.print(JSON.stringify(ret));
        return;
    }
    var array = sessionValidateCode.split("-");
    if (array.length != 2) {
        ret = ErrorCode.sms.E1M060002;
        out.print(JSON.stringify(ret));
        return;
    }
    var nowTime = new Date().getTime();
    var sendTime = array[1];
    if (nowTime - sendTime > 1000 * 60 * 30) {
        SessionService.removeSessionValue(sessionKey);
        ret = ErrorCode.sms.E1M060003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (array[0] != smsValidatingCode) {
        ret = ErrorCode.sms.E1M060004;
        out.print(JSON.stringify(ret));
        return;
    }
    out.print(JSON.stringify(ret));
})();