//#import Util.js
//#import pigeon.js
//#import login.js
//#import sysArgument.js
//#import session.js
//#import user.js
//#import DateUtil.js
//#import NoticeTrigger.js
//#import DESEncryptUtil.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import @server/util/UserUtil.jsx
//#import @server/util/CartUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;

    function getKey() {
        var value = ps20.getContent("appConfig_ole") + "";
        if (!value) {
            return null;
        }
        value = JSON.parse(value);
        //{data:{smsConfig:{encryptAppKey:'123456789'}}}
        return value.data.smsConfig && value.data.smsConfig.encryptAppKey || "";
    }

    var key = getKey();
    var iv = $.params['iv'];
    var sendParam = $.params['sendParam'];
    if (!iv || !sendParam) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var codeStr = DESEncryptUtil.decSign(key, iv, sendParam) + "";
    if (!codeStr) {
        ret = ErrorCode.sms.E1M060005;
        out.print(JSON.stringify(ret));
        return;
    }

    try {
        var jCode = JSON.parse(codeStr);
    } catch (e) {
        ret = ErrorCode.E1M000001;
        out.print(JSON.stringify(ret));
        return;
    }
    var type = jCode.sendType;//短信类型，register：注册，forgotPwd：忘记密码，bindMobile：绑定手机,bindVipCard:绑定会员卡发送短信,login:登录
    var sendPhone = jCode.sendPhone;//加密后的手机号与sessionId，格式是：mobilePhone,sessionId
    var validateCode = jCode.validateCode;//验证码
    var noticeId = 'notice_50101';//默认触发器类型，默认是注册的触发器，其他短信类型有不同的触发器

    var userId = LoginService.getFrontendUserId();//前台登录的用户
    if (!type) {
        ret = ErrorCode.sms.E1M060006;
        out.print(ret);
        return;
    }
    var phone = sendPhone;
    if (!phone) {
        ret = ErrorCode.sms.E1M060007;
        out.print(JSON.stringify(ret));
        return;
    }

    var regex_Mobile = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'regex_Mobile');//手机号码正则表达式
    if (!regex_Mobile) {
        regex_Mobile = "^(13[0-9]|15[0-9]|18[0|2|3|5|6|7|8|9]|147)\\d{8}$";
    }
    var mobileRegex = new RegExp(regex_Mobile);
    if (!mobileRegex.test(phone)) {
        ret = ErrorCode.sms.E1M060008;
        out.print(JSON.stringify(ret));
        return;
    }
    if (type != "register" && type != "forgotPwd" && type != "bindMobile" &&
        type != "bindVipCard" && type != "login" && type != "unbindVipCard" && type != "unbindMobile") {
        ret = ErrorCode.sms.E1M000006;
        out.print(JSON.stringify(ret));
        return;
    }
    if (type && type != 'register') {
        noticeId = "notice_50100";//发送短信验证码的触发器
        if (type == 'bindMobile' || type == 'bindVipCard' || type == 'unbindVipCard' || type == 'unbindMobile') {
            if (!userId) {
                ret = ErrorCode.sms.E1M000003;
                out.print(JSON.stringify(ret));
                return;
            }
        }
    }
    if (type == 'forgotPwd') {//找回密码的短信类型
        noticeId = "notice_55100";//找回密码的触发器
    }
    //取前台系统参数里配置的系统参数，看看发送短信前是不是需要先填验证码

    var wnValidateCode = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'wnValidateCode');//万能验证码
    //只要等于万能验证码，就通过
    if (wnValidateCode && wnValidateCode == validateCode) {
        //等于万能验证码，直接验证通过
    } else {
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


    //如果是找回密码或者登录，要判断这个手机号码是不是有注册过
    if (type == "forgotPwd" || type == "login") {
        var jUser = UserService.getUserByKey(phone);
        if (!jUser || !UserUtil.isOleMember(jUser)) {
            ret = ErrorCode.sms.E1M060010;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var sessionKey = "phoneValidateCode";
    var nowTime = new Date().getTime();
    var phoneValidateCode = SessionService.getSessionValue(sessionKey, request);
    if (phoneValidateCode) {
        var array = phoneValidateCode.split("-");
        if (array.length == 2) {
            var sendTime = array[1];
            if (nowTime - sendTime < 1000 * 60) {
                ret = ErrorCode.sms.E1M060011;
                out.print(JSON.stringify(ret));
                return;
            }
        }
    }
    //如果是注册，就要判断是否已经注册过
    if (type == 'register') {
        var jUser = UserService.getUserByKey(phone);
        if (jUser && jUser.passwordhash && UserUtil.isOleMember(jUser)) {
            ret = ErrorCode.sms.E1M060012;
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var randomCode = CommonUtil.getRandomCode();//六位验证码
    var webName = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'webName_cn');//网站名称
    var webUrl = SysArgumentService.getSysArgumentStringValue('head_merchant', 'col_sysargument', 'webUrl');//网站域名或IP地址

    var label = {
        "\\[validateCode\\]": randomCode,//验证码
        "\\[user:name\\]": phone,//下单时间
        "\\[validateInfo\\]": randomCode,//验证码
        "\\[sys:webname\\]": webName,//网站名
        "\\[sys:weburl\\]": webUrl//网站路径
    };
    var jUser = LoginService.getFrontendUser();
    if (jUser && (type == 'bindMobile' || type == 'bindMobile')) {
        label["\\[user:name\\]"] = jUser.realName || jUser.loginId || jUser.id;
    } else {
        userId = '';
    }
    var sendAmount = 0;
    try {
        var sendLimitKey = noticeId + "_maxSendAmount";
        var sendLimit = ps20.getAtom(sendLimitKey);//每个触发器针对每个手机号最多发送几条
        if (sendLimit && sendLimit > 0) {
            var phoneLimitKey = "TempSmsAmountLimit_" + noticeId + "_" + phone;
            var str = ps20.getContent(phoneLimitKey);
            if (str) {
                var sendObj = JSON.parse(str);
                var nowDate = DateUtil.getShortDate(new Date().getTime()).replace(/-/g, '');
                //超出短信条数限制
                if (sendObj.date == nowDate) {
                    if (sendObj.amount > sendLimit) {
                        ret = ErrorCode.sms.E1M060015;
                        out.print(JSON.stringify(ret));
                        return;
                    } else {
                        sendAmount = sendObj.amount;
                    }
                }
            }
        }
    } catch (e) {
        $.log(".................send error :" + e)
    }
    var jResult = NoticeTriggerService.sendNoticeEx(userId, phone, noticeId, CartUtil.getOleMerchantId() || "head_merchant", label);
    if (jResult.state != 'ok') {
        ret = ErrorCode.sms.E1M060012;
        ret.msg = jResult.msg;
        out.print(JSON.stringify(ret));
    } else {
        var findUser = UserService.getUserByKey(phone);
        if (type == 'forgotPwd' && findUser) {
            SessionService.addSessionValue("findPasswordUserId", findUser.id, request, response);//找回密码的用户ID
        } else if (type == 'bindMobile') {
            SessionService.addSessionValue("validatingMobilePhone", phone, request, response);//已验证的手机号码
        } else if (type == 'bindVipCard' && jUser) {//如果是绑定会员卡
            var cardObj = {
                validateCode: randomCode,
                lastSentTime: nowTime,
                validTime: '30',
                changeMobile: phone
            };
            jUser.validateVipCard = cardObj;
            UserService.updateUser(jUser, jUser.id);
        }
        sendAmount++;
        ret.data = {
            msgSendAmount: sendAmount
        };
        SessionService.addSessionValue("phoneValidatePhone", phone, request, response);
        SessionService.addSessionValue(sessionKey, randomCode + "-" + nowTime, request, response);
        out.print(JSON.stringify(ret));
    }
})();