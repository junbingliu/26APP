//#import Util.js
//#import sysArgument.js
//#import login.js
//#import DigestUtil.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        var ret = {
            state:false,
            errorCode:""
        };
        try {
            var webName = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument","webName_cn");
            var webUrl = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "webUrl");
            setPageDataProperty(pageData,"webName",webName);
            setPageDataProperty(pageData,"normalWebSite",webUrl);

            var loginId = $.params.lid;
            var paramCode = $.params.code;
            if(!paramCode){
                ret.errorCode = "code_empty";
                setPageDataProperty(pageData,"result",ret);
                return;
            }
            if(!loginId || loginId == ""){
                ret.errorCode = "login_id_empty";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            paramCode = Packages.java.net.URLDecoder.decode(paramCode, "UTF-8") + "";
            var user = LoginApi.IsoneModulesEngine.memberService.getUserByKey(loginId);
            if (user == null) {
                ret.errorCode = "member_not_exist";
                setPageDataProperty(pageData,"result",ret);
                return;
            }
            user = JSON.parse(user.toString());
            var resetPwd = user.resetPwd;
            if(!resetPwd){
                ret.errorCode = "link_invalid";//无效的
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var paramsStr = "";
            if($.params.t && $.params.t == "2"){
                if(!resetPwd.validateCode){
                    ret.errorCode = "link_invalid";//无效的
                    setPageDataProperty(pageData,"result",ret);
                    return;
                }

                var linkTimeout = resetPwd.validTimeMobile;
                if(!linkTimeout){
                    linkTimeout = 30;//分钟
                }
                var lastTime = resetPwd.lastMsgSentTime;
                var curTime = new Date().getTime();
                if(curTime - lastTime > linkTimeout * 60 * 1000){
                    ret.errorCode = "link_expire";//过期，失效
                    setPageDataProperty(pageData,"result",ret);
                    return;
                }

                paramsStr = "loginId=" + user.loginId + "&mobilPhone=" + user.mobilPhone + "&validateCode=" + resetPwd.validateCode;
            }else{
                if(!resetPwd.emailRandom){
                    ret.errorCode = "link_invalid";//无效的
                    setPageDataProperty(pageData,"result",ret);
                    return;
                }

                var linkTimeout = resetPwd.validTime;
                if(!linkTimeout){
                    linkTimeout = 24;//小时
                }
                var lastTime = resetPwd.lastSentTime;
                var curTime = new Date().getTime();
                if(curTime - lastTime > linkTimeout * 60 * 60 * 1000){
                    ret.errorCode = "link_expire";//过期，失效
                    setPageDataProperty(pageData,"result",ret);
                    return;
                }

                paramsStr = "loginId=" + user.loginId + "&email=" + user.email + "&emailRandom=" + resetPwd.emailRandom;
            }
            var digestCode = DigestUtil.digestString(paramsStr, "SHA");
            digestCode = Packages.net.xinshi.isone.commons.Base64Coder.encode(digestCode,"utf-8") + "";
            if(!digestCode || digestCode != paramCode){
                ret.errorCode = "link_invalid";//无效的
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            ret.state = true;
            ret.errorCode = "";
            ret.loginId = user.loginId;
            ret.digestCode = digestCode;
            ret.type = $.params.t;
            setPageDataProperty(pageData,"result",ret);
        } catch (e) {
            ret.state = false;
            ret.errorCode = "system_error";
            setPageDataProperty(pageData,"result",ret);
            $.log(e);
        }
    });
})(dataProcessor);