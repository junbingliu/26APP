//#import Util.js
//#import sysArgument.js
//#import login.js
//#import user.js
//#import DateUtil.js
//#import DigestUtil.js
//#import json2.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {

        var selfApi = new JavaImporter(
            Packages.java.lang,
            Packages.java.net,
            Packages.java.util,
            Packages.java.text,
            Packages.net.xinshi.isone.modules,
            Packages.org.json,
            Packages.net.xinshi.isone.modules.businessruleEx,
            Packages.net.xinshi.isone.modules.businessruleEx.rule.bean,
            Packages.net.xinshi.isone.modules.user,
            Packages.net.xinshi.isone.commons
        );

        try {
            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");
            setPageDataProperty(pageData,"webName",webName);
            var ret = {
                state :false,
                errorCode : ""
            };


            var loginId = $.params.loginId;
            var email = $.params.email;
            var code = $.params.code;

            if(!(loginId && email && code)){
                ret.errorCode = "params_error";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var result = LoginService.judgeMemberField(loginId);
            if (!result || result == "null") {
                ret.errorCode = "loginId_not_exist";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            result = LoginService.judgeMemberField(email);
            if (!result || result == "null") {
                ret.errorCode = "email_not_exist";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var user = UserService.getUserByKey(loginId);
            if(!user){
                ret.errorCode = "user_not_exist";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            if(user["checkedemailStatus"] == "1"){
                ret.errorCode = "has_verified";  //已经验证过
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var paramCode = selfApi.URLDecoder.decode(code, "UTF-8") + "";
            var validateRandom = user["validateRandom"];

            var params = "loginId=" + loginId + "&email=" + email + "&random=" + validateRandom;
            var vCode = DigestUtil.digestString(params, "SHA");
            vCode = Packages.net.xinshi.isone.commons.Base64Coder.encode(vCode,"utf-8") + "";

            if(vCode != paramCode){
                ret.errorCode = "validate_failure";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var memberGroupId = "",employeeEmailSuffix = [];;
            if(pageData.config && pageData.config.employeeMemberGroupId && pageData.config.employeeMemberGroupId.value != ""){
                memberGroupId = pageData.config.employeeMemberGroupId.value;
            }
            if(pageData.config && pageData.config.employeeEmailSuffix && pageData.config.employeeEmailSuffix.value != ""){
                var emailSuffix = pageData.config.employeeEmailSuffix.value;
                employeeEmailSuffix = emailSuffix.split(",");
            }

            if(memberGroupId == "" || employeeEmailSuffix.length == 0){
                ret.errorCode = "config_error";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var hasFirstValidateEmail = false;
            if (user["hasFirstValidateEmail"] == "1") {
                hasFirstValidateEmail = true;
            }

            user["checkedemailStatus"] = "1";
            user["isEnable"] = "1";
            user["hasFirstValidateEmail"] = "1";//是否已经验证过一次邮箱
            var date = new selfApi.Date();
            var objSDF = new selfApi.SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            user["lastModifiedTime"] = objSDF.format(date) + "";
            var userId = user.id;

            user["validateCode"] = undefined;
            user["validateRandom"] = undefined;
            user["validateTime"] = undefined;

            user["isEnable"] = "1";//表示激活

            var javaUserJson = $.toJavaJSONObject(user);
            selfApi.IsoneModulesEngine.memberService.addMemberField(email, userId); //增加唯一的电子邮件
            selfApi.IsoneModulesEngine.memberService.updateUser(javaUserJson, userId);

            //如果已经激活过一次邮件的就不再执行赠送规则了
            var recommendedUserId = user["recommendedUserId"];
            if(!recommendedUserId){
                recommendedUserId = "";
            }
            if (!hasFirstValidateEmail) {
                //执行注册奖励规则
                selfApi.IsoneBusinessRuleEngineEx.registerPlanExecutor.executePlan(selfApi.Global.HEAD_MERCHANT, userId, selfApi.Behavior.email_activation);
                //执行推荐会员奖励规则
                selfApi.IsoneBusinessRuleEngineEx.recommendMemberPlanExecutor.executePlan(selfApi.Global.HEAD_MERCHANT, recommendedUserId, userId, selfApi.Behavior.email_activation);
            }

            var isEmployee = false;
            var suffix = email.substring(email.indexOf("@")+1);
            for(var i=0;i<employeeEmailSuffix.length;i++){
                if(employeeEmailSuffix[i] == suffix){
                    isEmployee = true;
                    break;
                }
            }

            if(isEmployee){
                //内部员工，加入特定组
                selfApi.IsoneModulesEngine.memberService.addUserToGroup(userId,memberGroupId,new Date().getTime(),4102415999000);
            }

            ret.errorCode = "";
            ret.state = true;
            ret.email = email;
            ret.loginId = loginId;
            ret.isEmployee = isEmployee;
            setPageDataProperty(pageData,"result",ret);
        } catch (e) {
            setPageDataProperty(pageData,"result",{"state":false,"errorCode":"system_error"});
            $.log(e);
        }
    });
})(dataProcessor);