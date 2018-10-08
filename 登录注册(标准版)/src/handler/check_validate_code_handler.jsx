//#import Util.js
//#import login.js
//#import NoticeTrigger.js
//#import session.js
//#import DigestUtil.js
//#import pageService.js
//#import sysArgument.js
//#import DateUtil.js

;(function() {
    var ret = {
        state:false,
        errorCode:""
    };
    try{
        var skey = $.params.skey;
        if(!skey || skey == ""){
            ret.errorCode = "skey_empty";
            out.print(JSON.stringify(ret));
            return;
        }

        var paramCode = $.params.code;
        if(!paramCode || paramCode == ""){
            ret.errorCode = "code_empty";
            out.print(JSON.stringify(ret));
            return;
        }

        var loginKey = SessionService.getSessionValue(skey, request);
        if(!loginKey || loginKey == ""){
            ret.errorCode = "login_key_empty";
            out.print(JSON.stringify(ret));
            return;
        }else{
            var user = LoginApi.IsoneModulesEngine.memberService.getUserByKey(loginKey);
            if(user == null){
                ret.errorCode = "member_not_exist";
                out.print(JSON.stringify(ret));
                return;
            }else{
                user = JSON.parse(user.toString());
            }
            var userMobile = user.mobilPhone;
            if(!userMobile || userMobile == ""){
                ret.errorCode = "member_mobile_not_exist";
                out.print(JSON.stringify(ret));
                return;
            }
            var userLoginId = user.loginId;
            var userId = user.id;


            var mid = $.params.mid;
            var pageId = $.params.pageId;
            //if(!pageId || pageId == ""){
            //    ret.errorCode = "pageId_empty";
            //    out.print(JSON.stringify(ret));
            //    return;
            //}
            //if(!mid || mid == ""){
            //    ret.errorCode = "mid_empty";
            //    out.print(JSON.stringify(ret));
            //    return;
            //}

            var validTime = 30;//分钟,失效时间
            var maxTimes = 10;//每日最大次数
            var pageData = pageService.getMerchantPageData(mid,appId,pageId);
            if(pageData && pageData.config && pageData.config.validTimeMobile && pageData.config.validTimeMobile.value != ""){
                validTime = parseInt(pageData.config.validTimeMobile.value);
            }

            if(pageData && pageData.config && pageData.config.maxTimes && pageData.config.maxTimes.value != ""){
                maxTimes = parseInt(pageData.config.maxTimes.value);
            }

            var curTime = new Date().getTime();
            var shortDate = DateUtil.getStringDate(curTime,"yyyyMMdd") + "";

            var resetPwd = user.resetPwd;
            if(!resetPwd){
                resetPwd = {};
            }

            var operateTimes = resetPwd.operateTimes;
            if(operateTimes){
                var times = operateTimes[shortDate];
                if(times && times >= maxTimes){
                    ret.errorCode = "has_max_times";
                    ret.maxTimes = maxTimes;
                    out.print(JSON.stringify(ret));
                    return;
                }
            }


            var validateCode = resetPwd.validateCode;
            if(!validateCode || validateCode == ""){
                ret.errorCode = "validateCode_not_exist";
                out.print(JSON.stringify(ret));
                return;
            }
            if(paramCode != validateCode){
                ret.errorCode = "validateCode_error";
                out.print(JSON.stringify(ret));
                return;
            }



            var params = "loginId=" + userLoginId + "&mobilPhone=" + userMobile + "&validateCode=" + validateCode;
            var digestCode = DigestUtil.digestString(params, "SHA");
            digestCode = Packages.net.xinshi.isone.commons.Base64Coder.encode(digestCode,"utf-8") + "";
            var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrl");
            var webUrlHttps = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrlHttps");
            if(!webUrlHttps){
                webUrlHttps = webUrl;
            }

            var todayTimes = 0;
            if(resetPwd.operateTimes && resetPwd.operateTimes[shortDate]){
                todayTimes = resetPwd.operateTimes[shortDate];
            }
            var operateTimes = {};
            operateTimes[shortDate] = todayTimes + 1;
            resetPwd.operateTimes = operateTimes;
            resetPwd.validTimeMobile = validTime;
            user.resetPwd = resetPwd;
            LoginApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(user), userId);

            ret.webUrl = webUrlHttps;
            ret.encode = Packages.java.net.URLEncoder.encode(digestCode, "UTF-8") + "";
            ret.loginId = userLoginId;
            ret.skey = skey;
            ret.state = true;
            ret.errorCode = "";
        }
    }catch (e){
        $.log(e);
        ret.state = false;
        ret.errorCode = "system_error";
    }
    out.print(JSON.stringify(ret));
})();