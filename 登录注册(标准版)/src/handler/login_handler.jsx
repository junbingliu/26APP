//#import Util.js
//#import user.js
//#import login.js
//#import session.js
//#import sysArgument.js
//#import pageService.js
//#import DateUtil.js
//#import @jsLib/GenToken.jsx

;(function(){
    try{
        var errorCode = "";
        var needCaptcha = true;
        var ret = {
            state:false,
            errorCode:errorCode
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

        var loginKey = $.params.loginKey;    //登录Id，可以是loginId，email,mobilePhone
        var password = $.params.password;  //登录密码
        var captcha = $.params.captcha;    //验证码
        var rurl = $.params.rurl;  //返回url
        var markPwd = $.params.markPwd   //记住密码

        if(!loginKey){
            errorCode = "empty_loginKey";
        }else if(/.*[\u4e00-\u9fa5]+.*$/.test(loginKey)){
            errorCode = "loginId_not_allow_chinese";
        }else if(!password){
            errorCode = "empty_password";
        }else if(needCaptcha && !captcha){
            errorCode = "empty_captcha";
        }else{
            var checkResult = true;
            var pattern = /[`~!#$%^&*()+<>?:"{},\/;'[\]]/im;
            for (var i = 0; i < loginKey.length; i++) {
                var val = loginKey[i];
                if(pattern.test(val)){
                    checkResult = false;
                    break;
                }
            }
            if(!checkResult){
                ret.errorCode = "loginKey_unlawful";
                ret.lockingTime = lockingTime;
                out.print(JSON.stringify(ret));
                return;
            }


            //特殊验证码，压力测试用
            var specialCaptcha = "111111",specialCaptcha2 = "888888",specialCaptcha3="ewj.hk20150619";
            var sessionCaptcha = SessionService.getSessionValue("ValidateCode",request);
            SessionService.removeSessionValue("ValidateCode");
            if((captcha != specialCaptcha && captcha != specialCaptcha2 && captcha != specialCaptcha3) && (!sessionCaptcha || sessionCaptcha.toLowerCase() != captcha.toLowerCase())){
                errorCode = "captcha_error";
            }else{
                var jUser = LoginApi.IsoneModulesEngine.memberService.getUserByKey(loginKey);
                var user = null;
                if(jUser != null){
                    user = JSON.parse(jUser.toString());
                    var lockingTime = 10;//分钟,锁定时间
                    var maxTimes = 5;//每日最大次数
                    var pageData = pageService.getMerchantPageData("head_merchant","ewj_login","signIn");
                    if(pageData && pageData.config && pageData.config.lockingTime && pageData.config.lockingTime.value != ""){
                        lockingTime = parseInt(pageData.config.lockingTime.value);
                    }

                    if(pageData && pageData.config && pageData.config.dayMaxTimes && pageData.config.dayMaxTimes.value != ""){
                        maxTimes = parseInt(pageData.config.dayMaxTimes.value);
                    }
                    //检查登录错误次数
                    var curTime = new Date().getTime();
                    var loginErrorLog = user.loginErrorLog || {};
                    var unlockTime = loginErrorLog.unlockTime || 0;
                    if(unlockTime > 0 && unlockTime >= curTime){
                        ret.errorCode = "locked";
                        ret.lockingTime = lockingTime;
                        out.print(JSON.stringify(ret));
                        return;
                    }
                    if(unlockTime > 0 &&  curTime > unlockTime){
                        //如果已经超过锁定时间，则解锁。
                        var shortDate = DateUtil.getStringDate(curTime,"yyyyMMdd") + "";
                        var operateTimes = loginErrorLog.operateTimes || {};
                        operateTimes[shortDate] = 0;
                        loginErrorLog.unlockTime = 0;
                        user.loginErrorLog = loginErrorLog;
                        UserService.updateUser(user,user.id);
                    }
                }


                //var resultCode = {100:"success",101:"data_error",102:"data_error",103:"password_error",104:"member_not_exist",105:"not_enabled"};
                var resultCode = {100:"success",101:"data_error",102:"data_error",103:"account_or_pwd_error",104:"account_or_pwd_error",105:"not_enabled"};
                var result = LoginApi.LoginUtil.loginByKey(loginKey, password, LoginApi.LoginUtil.TARGET_MEMBER);

                if(result == 100){
                    //100 ==  IUserService.LOGIN_SUCCESSFUL
                    //var user = LoginApi.IsoneModulesEngine.memberService.getUserByKey(loginKey);
                    if(jUser == null){
                        ret["state"] = false;
                        errorCode = resultCode["104"];
                    }else{
                        var userId = jUser.optString("id");
                        LoginApi.LoginSessionUtils.loginFrontend(request, response, userId);
//                        Packages.net.xinshi.isone.modules.user.LoginSessionUtils.loginFrontend(request, response, userId);


                        //登录成功后清除登录错误记录
                        jUser.remove("loginErrorLog");


                        //记录最后登录时间
                        var isOK = LoginApi.UserUtil.setLastLoginLog(jUser, request);
                        if (isOK) {
                            LoginApi.IsoneModulesEngine.adminService.updateUser(jUser, userId);
                        }
                        //执行登录送积分规则
                        LoginApi.IsoneBusinessRuleEngineEx.loginPlanExecutor.executePlan(LoginApi.Global.HEAD_MERCHANT, userId);
                        ret["state"] = true;

                        if(rurl && rurl != ""){
                            //var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrl");
                            //if((webUrl && (rurl.indexOf("http://") > -1 || rurl.indexOf("https://") > -1) && rurl.indexOf(webUrl) == -1)){
                            //    rurl = "";
                            //}
                            if(rurl.indexOf("/register.html") > -1 || rurl.indexOf("/login.html") > -1 || rurl.indexOf("/register_email_validate.html") > -1 || rurl.indexOf("/register_success.html") > -1){
                                rurl = "";
                            }

                            var javaRurl = new Packages.java.lang.String(rurl);
                            if(javaRurl.startsWith("/ucenter")){
                                var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webUrl");
                                rurl = webUrl + rurl;
                            }

                            ret.rurl = rurl;
                        }

                        if(markPwd == "true"){
                            var loginSessionUtils = new Packages.net.xinshi.isone.modules.user.LoginSessionUtils();
                            loginSessionUtils.setKeepLoginTime(30 * 24 * 60 * 60 * 1000,request);
                        }



                    }
                }else{
                    ret["state"] = false;
                    if(result == 103){
                        if(user){
                            var shortDate = DateUtil.getStringDate(curTime,"yyyyMMdd") + "";
                            var operateTimes = loginErrorLog.operateTimes || {};
                            var times = operateTimes[shortDate] || 0;
                            if(times == 0){
                                loginErrorLog.operateTimes = {};
                            }
                            times++;
                            loginErrorLog.operateTimes[shortDate] = times;
                            if(times >= maxTimes){
                                loginErrorLog.unlockTime = curTime + (lockingTime * 60 * 1000);
                            }
                            user.loginErrorLog = loginErrorLog;
                            UserService.updateUser(user,user.id);
                        }
                    }


                }
                errorCode = resultCode[result];
            }
        }
        //ret.loginKey = loginKey;
        ret.errorCode = errorCode;
        out.print(JSON.stringify(ret));
    }catch(e){
        var ret = {
            state:false,
            errorCode:"system_error"
        }
        out.print(JSON.stringify(ret));
        $.log(e);
    }
})();