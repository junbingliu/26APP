//#import Util.js
//#import login.js
//#import NoticeTrigger.js
//#import DigestUtil.js
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
        var token = GenToken.get("bindMobileToken");
        if(!token) {
            ret.errorCode = "token_null";
            out.print(JSON.stringify(ret));
            return;
        }else if(paramToken != token){
            ret.errorCode = "token_error";
            out.print(JSON.stringify(ret));
            return;
        }


        var mobile = $.params.mobile;
        if(!mobile || mobile == ""){
            ret.errorCode = "mobile_empty";
            out.print(JSON.stringify(ret));
            return;
        }


        var userMobile = user.mobilPhone;
        if (mobile == userMobile) {
            var isValidate = user.checkedphoneStatus;
            if(isValidate == "1"){
                //当修改的邮箱和原来一样，并且是已经激活过的
                ret.errorCode = "mobile_not_change";
                out.print(JSON.stringify(ret));
                return;
            }
        }else{
            var checkResult = LoginService.judgeMemberField(mobile);
            if (checkResult && checkResult != "null") {
                ret.errorCode = "mobile_exist";
                out.print(JSON.stringify(ret));
                return;
            }
        }

        var userLoginId = user.loginId;
        var userId = user.id;

        var validTime = 30;//分钟,失效时间
        var maxTimes = 5;//每日最大次数

        var validateObj = user.validateObj;
        if(validateObj){
            if(!validateObj.mobile){
                validateObj.mobile = {};
            }
        }else{
            validateObj = {
                email:{},
                mobile:{}
            };
        }

        var intervalTime = 120;//秒
        var lastTime = validateObj.mobile.lastSentTime;
        if(lastTime){
            var remainingTime = (new Date().getTime()) - lastTime;
            if(remainingTime <= intervalTime * 1000){
                ret.errorCode = "please_wait";
                //ret.remainingTime = remainingTime / 1000; //秒
                out.print(JSON.stringify(ret));
                return;
            }
        }

        var validateCode = function(){
            var num = "";
            for(var i=0;i<6;i++){
                num += Math.floor(Math.random() * 10);
            }
            return num;
        }();
        //var params = "loginId=" + userLoginId + "&mobilPhone=" + mobile + "&validateCode=" + validateCode;
        //var digestCode = DigestUtil.digestString(params, "SHA");

        validateObj.mobile.validateCode = validateCode;
        validateObj.mobile.lastSentTime = new Date().getTime();
        validateObj.mobile.validTime = validTime;
        validateObj.mobile.changeMobile = mobile;

        user.validateObj = validateObj;

        //
        var webName = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webName_cn");

        var jLabel = new NoticeTriggerApi.JSONObject();
        jLabel.put("\\[user:name\\]", userLoginId);
        jLabel.put("\\[validateInfo\\]", validateCode);
        jLabel.put("\\[sys:webname\\]", webName);
        NoticeTriggerApi.IsoneModulesEngine.noticeTrigger.sendNotice(userId, mobile, "notice_50100", "head_merchant", jLabel);

        LoginApi.IsoneModulesEngine.memberService.updateUser($.toJavaJSONObject(user), userId);
        ret.state = true;
        ret.errorCode = "";
        ret.validTime = validTime;
    }catch (e){
        $.log(e);
        ret.state = false;
        ret.errorCode = "system_error";
    }
    out.print(JSON.stringify(ret));
})();