//#import Util.js
//#import login.js
//#import NoticeTrigger.js
//#import session.js
//#import DigestUtil.js
//#import pageService.js
//#import sysArgument.js
//#import DateUtil.js
//#import @jsLib/GenToken.jsx

;(function() {
    var ret = {
        state:false,
        errorCode:""
    };
    try{

        var userId = "";
        var user = LoginService.getFrontendUser();
        if(user){
            userId = user.id;
        }else{
            ret.errorCode = "not_logged";
            out.print(JSON.stringify(ret));
            return;
        }

        var paramToken = $.params.token;
        if(!paramToken){
            ret.errorCode = "token_empty";
            out.print(JSON.stringify(ret));
            return;
        }
        var token = GenToken.get("bindEmailToken");
        if(!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }


        var email = $.params.email;
        if(!email || email == ""){
            ret.errorCode = "email_empty";
            out.print(JSON.stringify(ret));
            return;
        }

        var userEmail = user.email;
        if (email == userEmail) {
            var isValidate = user.checkedemailStatus;
            if(isValidate == "1"){
                //当修改的邮箱和原来一样，并且是已经激活过的
                ret.errorCode = "email_not_change";
                out.print(JSON.stringify(ret));
                return;
            }
        }else{
            var checkResult = LoginService.judgeMemberField(email);
            if (checkResult && checkResult != "null") {
                ret.errorCode = "email_exist";
                out.print(JSON.stringify(ret));
                return;
            }
        }

        var userLoginId = user.loginId;
        var userId = user.id;

        var validTime = 24;//小时,失效时间
        var maxTimes = 5;//每日最大次数

        var validateObj = user.validateObj;
        if(validateObj){
            if(!validateObj.email){
                validateObj.email = {};
            }
        }else{
            validateObj = {
                email:{},
                mobile:{}
            };
        }

        var emailRandom = Math.random() + "";
        var params = "loginId=" + userLoginId + "&email=" + email + "&emailRandom=" + emailRandom;
        var digestCode = DigestUtil.digestString(params, "SHA");

        validateObj.email.emailRandom = emailRandom;
        validateObj.email.lastSentTime = new Date().getTime();
        validateObj.email.validTime = validTime;
        validateObj.email.changeEmail = email;

        user.validateObj = validateObj;

        //触发发送找回密码邮件
        var webName = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webName_cn");
        var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrl");

        var validateUrl = webUrl + "/ucenter/bind_email_validate.html?lid=" + userLoginId + "&code=" + (Packages.java.net.URLEncoder.encode(digestCode, "UTF-8"));
        var jLabel = new NoticeTriggerApi.JSONObject();
        jLabel.put("\\[user:name\\]", userLoginId);
        jLabel.put("\\[user:email\\]", email);
        jLabel.put("\\[validateInfo\\]", validateUrl);
        jLabel.put("\\[sys:webname\\]", webName);
        jLabel.put("\\[sys:weburl\\]", webUrl);
        NoticeTriggerApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId, email, "notice_50100", "head_merchant", jLabel);

        var emailSuffix = email.substring(email.indexOf("@") + 1);
        var emailLoginLink = "http://mail." + emailSuffix;

        LoginApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(user), userId);
        ret.emailLoginLink = emailLoginLink;
        ret.state = true;
        ret.email = email;
        ret.errorCode = "";
        ret.validTime = validTime;

        SessionService.removeSessionValue("bindEmailToken");
    }catch (e){
        $.log(e);
        ret.state = false;
        ret.errorCode = "system_error";
    }
    out.print(JSON.stringify(ret));
})();