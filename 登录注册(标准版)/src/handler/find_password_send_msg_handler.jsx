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

            var mid = $.params.mid || "";
            var pageId = $.params.pageId || "";

            var intervalTime = 60;//秒，发送间隔时间
            var pageData = pageService.getMerchantPageData(mid,appId,pageId);
            if(pageData && pageData.config && pageData.config.msgInterval && pageData.config.msgInterval.value != ""){
                intervalTime = parseInt(pageData.config.msgInterval.value);
            }

            var resetPwd = user.resetPwd;
            if(!resetPwd){
                resetPwd = {};
            }else{
                var lastTime = resetPwd.lastMsgSentTime;
                if(lastTime){
                    if((new Date().getTime()) - lastTime <= intervalTime * 1000){
                        ret.errorCode = "please_wait";
                        out.print(JSON.stringify(ret));
                        return;
                    }
                }
            }

            var validateCode = function(){
                var num = "";
                for(var i=0;i<6;i++){
                    num += Math.floor(Math.random() * 10);
                }
                return num;
            }();
            //var params = "loginId=" + userLoginId + "&mobilPhone=" + userMobile + "&validateCode=" + validateCode;
            //var digestCode = DigestUtil.digestString(params, "SHA");

            resetPwd.validateCode = validateCode;
            resetPwd.lastMsgSentTime = new Date().getTime();
            user.resetPwd = resetPwd;

            //触发发送找回密码邮件
            var webName = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webName_cn");
            var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrl");

            var jLabel = new NoticeTriggerApi.JSONObject();
            jLabel.put("\\[user:name\\]", userLoginId);
            jLabel.put("\\[validateInfo\\]", validateCode);
            jLabel.put("\\[sys:webname\\]", webName);
            jLabel.put("\\[sys:weburl\\]", webUrl);
            NoticeTriggerApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId,userMobile, "notice_55100", "head_merchant", jLabel);
//            SessionService.removeSessionValue(skey);

            LoginApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(user), userId);
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