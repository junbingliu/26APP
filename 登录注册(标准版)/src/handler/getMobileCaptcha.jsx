//#import Util.js
//#import login.js
//#import user.js
//#import session.js
//#import json2.js
//#import NoticeTrigger.js
//#import pageService.js
//#import @jsLib/GenToken.jsx

;(function() {

    function sendNotice(mobilPhone, noticeId, merchantId, jLabel) {
        var jNotice = NoticeTriggerApi.IsoneModulesEngine.noticeService.getNotice(noticeId);
        if (!jNotice) {
            return 1;
        }

        var noticeType = jNotice.optString("type");
        var jNoticeTemplate = jNotice.optJSONObject("template");
        if (jNoticeTemplate == null) {
            return 2;
        }
        if (!mobilPhone) {
            return 3;
        }

        var sendSms = jNotice.optString("sendSms");
        if (sendSms && sendSms == "是") {
            var templateType = Packages.net.xinshi.isone.modules.noticeTrigger.NoticeTemplateUtil.getMerchantTemplateType("smsTemplate", merchantId);
            var templateId = jNoticeTemplate.optString(templateType);

            if (templateId) {
                var jTemplate = NoticeTriggerApi.IsoneModulesEngine.noticeService.getTemplate(templateId);
                var content = NoticeTriggerApi.IsoneModulesEngine.noticeTrigger.getNoticeTemplateContent(jTemplate, jLabel);
                var smsBean = new Packages.net.xinshi.isone.modules.sms.bean.SmsBean();
                smsBean.setPhone(mobilPhone);
                smsBean.setMessage(content);
                smsBean.setLoginId("");
                smsBean.setSmsType(noticeType);
                var jSendMessage = smsBean.toJSON();
                jSendMessage.put("merchantId", merchantId);
                try {
                    NoticeTriggerApi.IsoneModulesEngine.sms.sendSmsQue(jSendMessage);
                    return 0;
                } catch (e) {
                    $.log(e);
                    return -1;
                }
            }
        }
        return 4;
    }




    var ret = {
        state:false,
        errorCode:""
    };

    var mobileUserAgents = ["Nokia",//诺基亚，有山寨机也写这个的，总还算是手机，Mozilla/5.0 (Nokia5800 XpressMusic)UC AppleWebkit(like Gecko) Safari/530
        "SAMSUNG",//三星手机 SAMSUNG-GT-B7722/1.0+SHP/VPP/R5+Dolfin/1.5+Nextreaming+SMM-MMS/1.2.0+profile/MIDP-2.1+configuration/CLDC-1.1
        "MIDP-2",//j2me2.0，Mozilla/5.0 (SymbianOS/9.3; U; Series60/3.2 NokiaE75-1 /110.48.125 Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/413 (KHTML like Gecko) Safari/413
        "CLDC1.1",//M600/MIDP2.0/CLDC1.1/Screen-240X320
        "SymbianOS",//塞班系统的，
        "MAUI",//MTK山寨机默认ua
        "UNTRUSTED/1.0",//疑似山寨机的ua，基本可以确定还是手机
        "Windows CE",//Windows CE，Mozilla/4.0 (compatible; MSIE 6.0; Windows CE; IEMobile 7.11)
        "iPhone",//iPhone是否也转wap？不管它，先区分出来再说。Mozilla/5.0 (iPhone; U; CPU iPhone OS 4_1 like Mac OS X; zh-cn) AppleWebKit/532.9 (KHTML like Gecko) Mobile/8B117
        "iPad",//iPad的ua，Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; zh-cn) AppleWebKit/531.21.10 (KHTML like Gecko) Version/4.0.4 Mobile/7B367 Safari/531.21.10
        "Android",//Android是否也转wap？Mozilla/5.0 (Linux; U; Android 2.1-update1; zh-cn; XT800 Build/TITA_M2_16.22.7) AppleWebKit/530.17 (KHTML like Gecko) Version/4.0 Mobile Safari/530.17
        "BlackBerry",//BlackBerry8310/2.7.0.106-4.5.0.182
        "UCWEB",//ucweb是否只给wap页面？ Nokia5800 XpressMusic/UCWEB7.5.0.66/50/999
        "ucweb",//小写的ucweb貌似是uc的代理服务器Mozilla/6.0 (compatible; MSIE 6.0;) Opera ucweb-squid
        "BREW",//很奇怪的ua，例如：REW-Applet/0x20068888 (BREW/3.1.5.20; DeviceId: 40105; Lang: zhcn) ucweb-squid
        "J2ME",//很奇怪的ua，只有J2ME四个字母
        "YULONG",//宇龙手机，YULONG-CoolpadN68/10.14 IPANEL/2.0 CTC/1.0
        "YuLong",//还是宇龙
        "COOLPAD",//宇龙酷派YL-COOLPADS100/08.10.S100 POLARIS/2.9 CTC/1.0
        "TIANYU",//天语手机TIANYU-KTOUCH/V209/MIDP2.0/CLDC1.1/Screen-240X320
        "TY-",//天语，TY-F6229/701116_6215_V0230 JUPITOR/2.2 CTC/1.0
        "K-Touch",//还是天语K-Touch_N2200_CMCC/TBG110022_1223_V0801 MTK/6223 Release/30.07.2008 Browser/WAP2.0
        "Haier",//海尔手机，Haier-HG-M217_CMCC/3.0 Release/12.1.2007 Browser/WAP2.0
        "DOPOD",//多普达手机
        "Lenovo",// 联想手机，Lenovo-P650WG/S100 LMP/LML Release/2010.02.22 Profile/MIDP2.0 Configuration/CLDC1.1
        "LENOVO",// 联想手机，比如：LENOVO-P780/176A
        "HUAQIN",//华勤手机
        "AIGO-",//爱国者居然也出过手机，AIGO-800C/2.04 TMSS-BROWSER/1.0.0 CTC/1.0
        "CTC/1.0",//含义不明
        "CTC/2.0",//含义不明
        "CMCC",//移动定制手机，K-Touch_N2200_CMCC/TBG110022_1223_V0801 MTK/6223 Release/30.07.2008 Browser/WAP2.0
        "DAXIAN",//大显手机DAXIAN X180 UP.Browser/6.2.3.2(GUI) MMP/2.0
        "MOT-",//摩托罗拉，MOT-MOTOROKRE6/1.0 LinuxOS/2.4.20 Release/8.4.2006 Browser/Opera8.00 Profile/MIDP2.0 Configuration/CLDC1.1 Software/R533_G_11.10.54R
        "SonyEricsson",// 索爱手机，SonyEricssonP990i/R100 Mozilla/4.0 (compatible; MSIE 6.0; Symbian OS; 405) Opera 8.65 [zh-CN]
        "GIONEE",//金立手机
        "HTC",//HTC手机
        "ZTE",//中兴手机，ZTE-A211/P109A2V1.0.0/WAP2.0 Profile
        "HUAWEI",//华为手机，
        "webOS",//palm手机，Mozilla/5.0 (webOS/1.4.5; U; zh-CN) AppleWebKit/532.2 (KHTML like Gecko) Version/1.0 Safari/532.2 Pre/1.0
        "GoBrowser",//3g GoBrowser.User-Agent=Nokia5230/GoBrowser/2.0.290 Safari
        "IEMobile",//Windows CE手机自带浏览器，
        "WAP2.0"//支持wap 2.0的
    ];
    var mobileFlag = false;
    var userAgent = request.getHeader("user-agent");
    for (var i = 0; !mobileFlag && userAgent != null && !userAgent.trim().equals("") && i < mobileUserAgents.length; i++) {
        if (userAgent.contains(mobileUserAgents[i])) {
            mobileFlag = true;
            break;
        }
    }
    if (!mobileFlag) {
        var paramToken = $.params.token;
        if (!paramToken) {
            ret.errorCode = "token_empty";
            out.print(JSON.stringify(ret));
            return;
        }
        var token = GenToken.get("loginToken");
        if (!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        } else if (paramToken != token) {
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }
    }


    var mobilePhone = $.params.mobilePhone;
    if(!mobilePhone){
        ret.errorCode = "mobile_phone_empty";
        out.print(JSON.stringify(ret));
        return;
    }
    var checkResult = LoginService.judgeMemberField(mobilePhone);
    if (checkResult && checkResult != "null") {
        ret.errorCode = "mobile_phone_exist";
        out.print(JSON.stringify(ret));
        return;
    }
    var merchantId = "head_merchant";

    var mid = $.params.mid || "";
    var pageId = $.params.pageId || "";

    var intervalTime = 120;//秒，发送间隔时间
    var pageData = pageService.getMerchantPageData(mid,appId,pageId);
    if(pageData && pageData.config && pageData.config.msgInterval && pageData.config.msgInterval.value != ""){
        var msgInterval = Number(pageData.config.msgInterval.value);
        if(!isNaN(msgInterval)){
            intervalTime = msgInterval;
        }
    }

    var validTime = 30;//分钟，短信验证码有效时间
    if(pageData && pageData.config && pageData.config.validTimeMobile && pageData.config.validTimeMobile.value != ""){
        var vTime = Number(pageData.config.validTimeMobile.value);
        if(!isNaN(vTime)){
            validTime = vTime;
        }
    }


    //生成验证码
    var sessionName = "mobileCaptchaObj";
    var clientIp = $.getClientIp();
    var currTime = new Date().getTime();
    var timeOut = intervalTime * 1000;
    var mobileCaptchaObj = {},captchaObj;
    var sessionValue = SessionService.getSessionValue(sessionName,request);
    if(sessionValue){
        mobileCaptchaObj = JSON.parse(sessionValue);
        captchaObj = mobileCaptchaObj[mobilePhone];
    }
    if(captchaObj){
        var lastTime = captchaObj["lastTime"];
        if(lastTime + timeOut >= currTime){
            //检查一分钟只能发一次
            ret.errorCode = "wait";
            out.print(JSON.stringify(ret));
            return;
        }

        if(lastTime + (validTime * 60 * 1000) >= currTime){
            //在有效期内
            ret.errorCode = "active";
            out.print(JSON.stringify(ret));
            return;
        }
    }
    mobileCaptchaObj = {},captchaObj = {};
    var captcha = parseInt(Math.random() * 900000 + 100000);
    captchaObj["captcha"] = captcha;
    captchaObj["lastTime"] = currTime;
    captchaObj["clientIp"] = clientIp;
    mobileCaptchaObj[mobilePhone] = captchaObj;
    SessionService.addSessionValue(sessionName,JSON.stringify(mobileCaptchaObj),request,response);

    var jLabel = new NoticeTriggerApi.JSONObject();
    jLabel.put("\\[user:name\\]", mobilePhone);
    jLabel.put("\\[validateInfo\\]", captcha + "");
    var returnNum = sendNotice(mobilePhone, "notice_50100", merchantId, jLabel);
    if(returnNum == 0){
        ret.errorCode = "";
        ret.state = true;
    }else{
        ret.errorCode = "send_error";
    }
    out.print(JSON.stringify(ret));
})();