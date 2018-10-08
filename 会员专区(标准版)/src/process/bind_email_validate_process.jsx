//#import Util.js
//#import login.js
//#import user.js
//#import DigestUtil.js
//#import DateUtil.js
//#import sysArgument.js
//#import pageService.js

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

        var ret = {
            state:false,
            errorCode:""
        };

        try{
            var requestURI = request.getRequestURI() + "";
            var userId = "";

            var mid = "head_merchant";
            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn");

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

//            paramCode = Packages.java.net.URLDecoder.decode(paramCode, "UTF-8") + "";
            var user = LoginApi.IsoneModulesEngine.memberService.getUserByKey(loginId);
            if (user == null) {
                ret.errorCode = "member_not_exist";
                setPageDataProperty(pageData,"result",ret);
                return;
            }
            user = JSON.parse(user.toString());
            userId = user.id;
            var vEmailInfo = null;
            if(user.validateObj && user.validateObj.email){
                vEmailInfo = user.validateObj.email;
            }
            if(!vEmailInfo){
                ret.errorCode = "link_invalid";//无效的
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var linkTimeout = vEmailInfo.validTime;
            if(!linkTimeout){
                linkTimeout = 24;
            }
            var lastTime = vEmailInfo.lastSentTime;
            var curTime = new Date().getTime();
            if(curTime - lastTime > linkTimeout * 60 * 60 * 1000){
                ret.errorCode = "link_expire";//过期，失效
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            if(vEmailInfo.changeEmail == user.email && user.checkedemailStatus == "1"){
                ret.errorCode = "has_verified";
                setPageDataProperty(pageData,"result",ret);
                return;
            }

            var params = "loginId=" + user.loginId + "&email=" + vEmailInfo.changeEmail + "&emailRandom=" + vEmailInfo.emailRandom;
            var digestCode = DigestUtil.digestString(params, "SHA");
            if(!digestCode || digestCode != paramCode){
                ret.errorCode = "link_invalid";//无效的
                setPageDataProperty(pageData,"result",ret);
                return;
            }




            setPageDataProperty(pageData, "requestURI", requestURI + "");
            setPageDataProperty(pageData, "webName", webName);
            setPageDataProperty(pageData, "user", user);

            var hasFirstValidateEmail = false;
            if (user["hasFirstValidateEmail"] == "1") {
                hasFirstValidateEmail = true;
            }


            user.email = vEmailInfo.changeEmail;
            user.checkedemailStatus = "1";
            user.hasFirstValidateEmail = "1";

            var date = new selfApi.Date();
            var objSDF = new selfApi.SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
            user["lastModifiedTime"] = objSDF.format(date) + "";

            var javaUserJson = $.toJavaJSONObject(user);
            selfApi.IsoneModulesEngine.memberService.addMemberField(user.email, userId); //增加唯一的电子邮件
            selfApi.IsoneModulesEngine.memberService.updateUser(javaUserJson, userId);

            //================内部员工认证
            var pageDataReg = pageService.getMerchantPageData(mid,"ewj_login","registerEmailValidate");
            var memberGroupId = "",employeeEmailSuffix = [];;
            if(pageDataReg.config && pageDataReg.config.employeeMemberGroupId && pageDataReg.config.employeeMemberGroupId.value != ""){
                memberGroupId = pageDataReg.config.employeeMemberGroupId.value;
            }
            if(pageDataReg.config && pageDataReg.config.employeeEmailSuffix && pageDataReg.config.employeeEmailSuffix.value != ""){
                var emailSuffix = pageDataReg.config.employeeEmailSuffix.value;
                employeeEmailSuffix = emailSuffix.split(",");
            }

            var isEmployee = false;
            var suffix = vEmailInfo.changeEmail.substring(vEmailInfo.changeEmail.indexOf("@")+1);
            for(var i=0;i<employeeEmailSuffix.length;i++){
                if(employeeEmailSuffix[i] == suffix){
                    isEmployee = true;
                    break;
                }
            }

            if(isEmployee){
                //内部员工，加入特定组
                selfApi.IsoneModulesEngine.memberService.addUserToGroup(userId,memberGroupId,new Date().getTime(),4102415999000);
                ret.isEmployee = isEmployee;
            }
            //================内部员工认证


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

            ret.state = true;
            ret.errorCode = "";
            ret.loginId = user.loginId;
            //ret.digestCode = digestCode;
            setPageDataProperty(pageData,"result",ret);
        }catch (e){
            ret.state = false;
            ret.errorCode = "system_error";
            setPageDataProperty(pageData,"result",ret);
        }


    });
})(dataProcessor);