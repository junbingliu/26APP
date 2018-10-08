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

        var mid = $.params.mid;
        var pageId = $.params.pageId;
        if(!pageId || pageId == ""){
            ret.errorCode = "pageId_empty";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!mid || mid == ""){
            ret.errorCode = "mid_empty";
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
            var userEmail = user.email;
            if(!userEmail || userEmail == ""){
                ret.errorCode = "member_email_not_exist";
                out.print(JSON.stringify(ret));
                return;
            }
            var userLoginId = user.loginId;
            var userId = user.id;

            var validTime = 24;//小时,失效时间
            var maxTimes = 10;//每日最大次数
            var pageData = pageService.getMerchantPageData(mid,appId,pageId);
            if(pageData && pageData.config && pageData.config.validTime && pageData.config.validTime.value != ""){
                validTime = parseInt(pageData.config.validTime.value);
            }

            if(pageData && pageData.config && pageData.config.maxTimes && pageData.config.maxTimes.value != ""){
                maxTimes = parseInt(pageData.config.maxTimes.value);
            }

            var curTime = new Date().getTime();
            var shortDate = DateUtil.getStringDate(curTime,"yyyyMMdd") + "";
            var resetPwd = user.resetPwd;
            if(resetPwd){
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
            }else{
                resetPwd = {};
            }

            var emailRandom = Math.random() + "";
            var params = "loginId=" + userLoginId + "&email=" + userEmail + "&emailRandom=" + emailRandom;
            var digestCode = DigestUtil.digestString(params, "SHA");
            digestCode = Packages.net.xinshi.isone.commons.Base64Coder.encode(digestCode,"utf-8") + "";

            var todayTimes = 0;
            if(resetPwd.operateTimes && resetPwd.operateTimes[shortDate]){
                todayTimes = resetPwd.operateTimes[shortDate];
            }
            var operateTimes = {};
            operateTimes[shortDate] = todayTimes + 1;
            resetPwd.emailRandom = emailRandom;
            resetPwd.lastSentTime = new Date().getTime();
            resetPwd.validTime = validTime;
            resetPwd.operateTimes = operateTimes;
            user.resetPwd = resetPwd;

            //触发发送找回密码邮件
            var webName = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webName_cn");
            var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrl");
            var webUrlHttps = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrlHttps");
            if(!webUrlHttps){
                webUrlHttps = webUrl;
            }

            var setPwdUrl = webUrlHttps + "/reset_password.html?lid=" + userLoginId + "&code=" + (Packages.java.net.URLEncoder.encode(digestCode, "UTF-8"));
            var jLabel = new NoticeTriggerApi.JSONObject();
            jLabel.put("\\[user:name\\]", userLoginId);
            jLabel.put("\\[user:email\\]", userEmail);
            jLabel.put("\\[validateInfo\\]", setPwdUrl);
            jLabel.put("\\[sys:webname\\]", webName);
            jLabel.put("\\[sys:weburl\\]", webUrl);
            NoticeTriggerApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId, userEmail, "notice_55100", "head_merchant", jLabel);
//            SessionService.removeSessionValue(skey);

            var emailSuffix = userEmail.substring(userEmail.indexOf("@") + 1);
            var emailLoginLink = "http://mail." + emailSuffix;

            LoginApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(user), userId);
            ret.emailLoginLink = emailLoginLink;
            ret.skey = skey;
            ret.state = true;
            ret.errorCode = "";
            ret.validTime = validTime;
        }
    }catch (e){
        $.log(e);
        ret.state = false;
        ret.errorCode = "system_error";
    }
    out.print(JSON.stringify(ret));
})();