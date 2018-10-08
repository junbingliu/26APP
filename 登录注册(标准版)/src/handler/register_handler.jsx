//#import Util.js
//#import user.js
//#import login.js
//#import session.js
//#import DigestUtil.js
//#import json2.js
//#import NoticeTrigger.js
//#import DateUtil.js
//#import pageService.js
//#import sysArgument.js
//#import @jsLib/GenToken.jsx

var RegisterFunc = function(){
    var curApi = new JavaImporter(
        Packages.java.lang,
        Packages.java.net,
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.user,
        Packages.net.xinshi.isone.functions.user,
        Packages.org.json,
        Packages.net.xinshi.isone.modules.businessruleEx.rule.bean,
        Packages.net.xinshi.isone.commons
    );
    this.doAddUserAfterEvent = function(userId, parentUserId, config){
        var webUrl = config["webUrl"];
//        var defaultProjectValue = config["defaultProjectValue"];
        var isNeedVerifyEmail = config["isNeedVerifyEmail"];
        var ismobile = config["ismobile"];
        var isAppMulMerchant = config["isAppMulMerchant"] || true;
        var user = UserService.getUser(userId);
        var merchantId = curApi.HEAD_MERCHANT;
        if (!isAppMulMerchant) {
            merchantId = curApi.SINGLE_DEFAULT_MERCHANT;
        }
        //var appId = config["appId"];
        //var isEmployee = config["isEmployee"];

        //执行注册奖励规则
        LoginApi.IsoneBusinessRuleEngineEx.registerPlanExecutor.executePlan(curApi.Global.HEAD_MERCHANT, userId, curApi.Behavior.register);
        if (parentUserId) {
            var parentUser = UserService.getUser(parentUserId);
            var recommendedUserId = parentUser["id"];
            LoginApi.IsoneBusinessRuleEngineEx.recommendMemberPlanExecutor.executePlan(curApi.Global.HEAD_MERCHANT, recommendedUserId, userId, curApi.Behavior.register);

        }

        //手机注册并且短信验证成功的
        var checkedphoneStatus = user["checkedphoneStatus"];
        if (checkedphoneStatus == "1") {
            //执行注册奖励规则
            LoginApi.IsoneBusinessRuleEngineEx.registerPlanExecutor.executePlan(curApi.Global.HEAD_MERCHANT, userId, curApi.Behavior.sms_activation);
            //执行推荐会员奖励规则
            var recommendedUserId = user["recommendedUserId"];
            LoginApi.IsoneBusinessRuleEngineEx.recommendMemberPlanExecutor.executePlan(curApi.Global.HEAD_MERCHANT, recommendedUserId, userId, curApi.Behavior.sms_activation);
        }

        var loginId = user.loginId;
        var email = user.email;
        var currentTime = new Date().getTime();
        if (isNeedVerifyEmail && !ismobile && email) {
            //发送激活邮件
            try {
                var jUserLogin = $.toJavaJSONObject(user);
                var validateRandom = Math.random() + "";
                var params = "loginId=" + loginId + "&email=" + email + "&random=" + validateRandom;
                var validateCode = DigestUtil.digestString(params, "SHA");
                validateCode = Packages.net.xinshi.isone.commons.Base64Coder.encode(validateCode,"utf-8") + "";
                validateCode = curApi.URLEncoder.encode(validateCode, "UTF-8");
                //jUserLogin.put("validateCode", validateCode);
                jUserLogin.put("validateRandom", validateRandom);
                jUserLogin.put("checkedemailStatus", "0"); //设置邮箱未激活
                jUserLogin.put("validateTime", currentTime + "");  //设置发送时间，一遍过期。
                curApi.IsoneModulesEngine.memberService.updateUser(jUserLogin, userId);

                var date = DateUtil.getLongDate(currentTime);
                var jLabel = new curApi.JSONObject();
                jLabel.put("\\[user:name\\]", "<b>" + loginId + "</b>");
                jLabel.put("\\[user:time\\]", "<i>" + date + "</i>");
                var validateUrl = webUrl + "/register_email_validate.html?loginId=" + loginId + "&code=" + validateCode + "&email=" + email;
                jLabel.put("\\[validateInfo\\]", validateUrl);

                //if(isEmployee){
                    curApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId, email, "notice_55000", merchantId, jLabel);
                //}else{
                //    curApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId, email, "notice_50500", merchantId, jLabel);
                //}

            } catch (e) {
                $.log(e);
            }
        } else {
            //发送注册成功邮件
            var date = DateUtil.getLongDate(currentTime);
            var jLabel = new curApi.JSONObject();
            jLabel.put("\\[user:name\\]", loginId);
            jLabel.put("\\[user:time\\]", date);
            curApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId, "notice_50500", merchantId, jLabel);
        }
    }


};


;(function () {
    try {
        var errorCode = "";
        var needCaptcha = true;
        var ret = {
            state: false,
            errorCode: errorCode
        }

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
        var loginId = $.params.loginId;    //loginId
        var email = $.params.email;    //email
        var password = $.params.password;  //登录密码
        var mobilePhone = $.params.mobilePhone;  //手机
        var captcha = $.params.captcha;    //验证码
        var rurl = $.params.rurl;
        var hasCheckMobilePhone = false;
        var isRegisterPhoneValidate = true;

        if (!loginId) {
            errorCode = "empty_loginId";
        } else if (!/^[a-zA-Z]([a-zA-Z0-9(_)(\-)]+)$/.test(loginId)) {
            errorCode = "loginId_unlawful";
        } else if (!(loginId.length > 3 && loginId.length < 21)) {
            errorCode = "loginId_length_error";
        } else if(!(email || mobilePhone)){
            //errorCode = "empty_email_or_mobilePhone";
        }else if(email){
            //if (!/^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/.test(email)) {
            //    errorCode = "empty_unlawful";
            //}
        } else if (mobilePhone) {
            //var mobileRegex=new RegExp(SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","regex_Mobile"));
            //if(!mobileRegex.test(mobilePhone)){
            //    errorCode = "mobile_error";
            //}
        }  else if (!password) {
            errorCode = "empty_password";
        } else if (needCaptcha && !captcha) {
            errorCode = "empty_captcha";
        }
        if (errorCode != "") {
            ret.errorCode = errorCode;
            out.print(JSON.stringify(ret));
            return;
        }

        var sessionCaptcha = SessionService.getSessionValue("ValidateCode", request);
        SessionService.removeSessionValue("ValidateCode");

        //特殊验证码，压力测试用
        var specialCaptcha = "111111",specialCaptcha2 = "888888";

        if ((captcha != specialCaptcha || captcha != specialCaptcha2) && (!sessionCaptcha || sessionCaptcha.toLowerCase() != captcha.toLowerCase())) {
            ret.errorCode = "captcha_error";
            out.print(JSON.stringify(ret));
            return;
        }

        var result = LoginService.judgeMemberField(loginId);
        if (result && result != "null") {
            ret.errorCode = "loginId_exist";
            out.print(JSON.stringify(ret));
            return;
        }

        if(email) {
            result = LoginService.judgeMemberField(email);
            if (result && result != "null") {
                ret.errorCode = "email_exist";
                out.print(JSON.stringify(ret));
                return;
            }

        }

        var appId = $.params.appId;
        var pageId = $.params.pageId;
        var mid = $.params.mid;
        var pageData = pageService.getMerchantPageData(mid,appId,pageId);

        mobilePhone = false;//todo:暂时不支持手机注册
        if(mobilePhone) {
            result = LoginService.judgeMemberField(mobilePhone);
            if (result == "-1" || (result && result != "null")) {
                ret.errorCode = "mobile_exist";
                out.print(JSON.stringify(ret));
                return;
            }

            //验证手机
            if (isRegisterPhoneValidate) {
                var mobileValidateNot = false;//$.params.mobileValidate_not;
                if (!mobileValidateNot || mobileValidateNot == "0") {
                    var mobileValidateCode = $.params.mobileValidateCode;
                    if (!mobileValidateCode) {
                        ret.errorCode = "mobile_validate_code_empty";
                        out.print(JSON.stringify(ret));
                        return;
                    }

                    var validTime = 30;//分钟，短信验证码有效时间

                    if(pageData && pageData.config && pageData.config.validTimeMobile && pageData.config.validTimeMobile.value != ""){
                        var vTime = Number(pageData.config.validTimeMobile.value);
                        if(!isNaN(vTime)){
                            validTime = vTime;
                        }
                    }

                    var mobileCaptchaObj,validateCode;
                    var sessionValue = SessionService.getSessionValue("mobileCaptchaObj", request);
                    if(sessionValue){
                        mobileCaptchaObj = JSON.parse(sessionValue);
                        validateCode = mobileCaptchaObj[mobilePhone]
                    }
                    if (!validateCode) {
                        ret.errorCode = "phone_validate_code_empty";
                        out.print(JSON.stringify(ret));
                        return;
                    }
                    var timeOut = validTime * 60 * 1000;
                    var currTime = new Date().getTime();
                    if (currTime - validateCode["lastTime"] >= timeOut) {
                        //超时
                        ret.errorCode = "phone_validate_code_overdue";
                        out.print(JSON.stringify(ret));
                        return;
                    }

                    if (validateCode["captcha"] != mobileValidateCode) {
                        //验证码错误
                        ret.errorCode = "phone_validate_code_error";
                        out.print(JSON.stringify(ret));
                        return;
                    }
                    hasCheckMobilePhone = true;
                }
            }
        }

        if (errorCode != "") {
            ret.errorCode = errorCode;
            out.print(JSON.stringify(ret));
            return;
        }

        var baseGrade = 20;
        //判断密码强度，判断安全分数
        if(true){
            //判断输入密码的类型
            function CharMode(iN){
                if (iN>=48 && iN <=57) //数字
                    return 1;
                if (iN>=65 && iN <=90) //大写
                    return 2;
                if (iN>=97 && iN <=122) //小写
                    return 4;
                else
                    return 8;
            }
            //bitTotal函数
            //计算密码模式
            function bitTotal(num){
                var modes=0;
                for (i=0;i<4;i++){
                    if (num & 1) modes++;
                    num>>>=1;
                }
                return modes;
            }
            //返回强度级别
            function checkStrong(sPW){
                if (sPW.length<6)
                    return 0; //密码太短，不检测级别
                var Modes=0;
                for (var i=0;i<sPW.length;i++){
                    //密码模式
                    Modes|=CharMode(sPW.charCodeAt(i));
                }
                return bitTotal(Modes);
            }

            var s_level = checkStrong(password);
            switch(s_level) {
                case 0:
                case 1:
                    baseGrade = 20;
                    break;
                case 2:
                    baseGrade = 40;
                    break;
                default:
                    baseGrade = 60;
                    break;
            }
        }


        var source = "sys";
        var source_entrance = "default";
        var ran = Math.random() + "";
        var passran = password + ran;
        var passwordsha = DigestUtil.digestString(passran, "SHA");

        var jUser = {};
        jUser["loginId"] = loginId;
        jUser["passwordhash"] = passwordsha;
        jUser["random"] = ran;
        jUser["isAdmin"] = "0";
        jUser["merchantId"] = "";
        jUser["logo"] = "/upload/user_none_100.gif";
        jUser["parentId"] = "";
        jUser["source_isOnline"] = "1";//是否线上
        jUser["source"] = source;//来源
        jUser["source_entrance"] = source_entrance;//来源入口
        jUser["ip"] = $.getClientIp();
        jUser["userCardBindStatus"] = "0";
        jUser["isEnable"] = "1";//1表示激活
        jUser["grade"] = baseGrade + "";//安全等级分数

        email = false;//todo:暂时不支持Email注册
        if (email) {
            jUser["email"] = email;

            var activeAfterEmailValidate = "true";
            if(pageData && pageData.config && pageData.config.activeAfterEmailValidate && pageData.config.activeAfterEmailValidate.value != ""){
                if(pageData.config.activeAfterEmailValidate.value == "yes"){
                    activeAfterEmailValidate = "true";
                }else{
                    activeAfterEmailValidate = "false";
                }
            }
            if(activeAfterEmailValidate){
                jUser["isEnable"] = "0";
            }else{
                jUser["isEnable"] = "1";
            }

        }
        jUser["checkedemailStatus"] = "0";

        var checkedphoneStatus = "0";
        if (mobilePhone) {
            jUser["mobilPhone"] = mobilePhone;
            if (hasCheckMobilePhone) {
                checkedphoneStatus = "1";
                jUser["isEnable"] = "1";
            }
        }
        jUser["checkedphoneStatus"] = checkedphoneStatus;


        var javaUserJson = $.toJavaJSONObject(jUser);
        var userId = UserApi.IsoneModulesEngine.memberService.addUser(javaUserJson, null);
        


        //默认设置为普通会员
        var level = UserApi.IUserService.MEMBERGROUP_COMMON;
        UserApi.IsoneModulesEngine.memberService.updateMemberGroup(javaUserJson, UserApi.IUserService.MEMBERGROUP_TYPE_ONE, level);

        if (loginId) {
            UserApi.IsoneModulesEngine.memberService.addMemberField(loginId, userId);//增加唯一的登录账号
        }
        if (email) {
            UserApi.IsoneModulesEngine.memberService.addMemberField(email, userId);//增加唯一的邮箱账号
        }
        if (hasCheckMobilePhone) {
            //当手机验证通过，把手机绑定帐号，可以通过手机进行登录
            UserApi.IsoneModulesEngine.memberService.addMemberField(mobilePhone, userId);
            //var isExists = InternalMemberRegisterService.getById(mobilePhone);
            //if(isExists && isExists != "null"){
            //    //内部员工手机
            //    var validatePageData = pageService.getMerchantPageData(mid,appId,"registerEmailValidate");
            //    var memberGroupId = null;
            //    if(validatePageData.config && validatePageData.config.employeeMemberGroupId && validatePageData.config.employeeMemberGroupId.value != ""){
            //        memberGroupId = validatePageData.config.employeeMemberGroupId.value;
            //    }
            //
            //    if(memberGroupId){
            //        //内部员工，加入特定组
            //        UserApi.IsoneModulesEngine.memberService.addUserToGroup(userId,memberGroupId,new Date().getTime(),4102415999000);
            //    }else{
            //        $.log("employeeMemberGroupId_not_config");
            //    }
            //}

        }
		
		if(jUser["isEnable"] == "1"){
			UserApi.LoginSessionUtils.loginFrontend(request, response, userId);
		}
		

        var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrl")
        var registerFunc = new RegisterFunc();
        var parentUserId = "";
        var jConfig = {
            isNeedVerifyEmail:true,
            webUrl:webUrl
        };
        //注册成功后事件
        registerFunc.doAddUserAfterEvent(userId, parentUserId, jConfig);

        var redirect = "";


        ret.state = true;
        errorCode = "";
        ret.errorCode = errorCode;
        out.print(JSON.stringify(ret));
    } catch (e) {
        var ret = {
            state: false,
            errorCode: "system_error"

        }
        out.print(JSON.stringify(ret));
        $.log(e);
    }
})();