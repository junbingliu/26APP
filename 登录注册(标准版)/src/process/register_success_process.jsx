//#import Util.js
//#import Info.js
//#import sysArgument.js
//#import DateUtil.js
//#import login.js

(function (processor) {
    processor.on("all", function (pageData, dataIds, elems) {
        try {
            var selfApi = new JavaImporter(
                Packages.org.json,
                Packages.net.xinshi.isone.modules,
                Packages.net.xinshi.isone.modules.user,
                Packages.net.xinshi.isone.commons,
                Packages.java.util,
                Packages.java.lang,
                Packages.java.net,
                Packages.net.xinshi.isone.modules.businessruleEx,
                Packages.net.xinshi.isone.modules.businessruleEx.rule.bean,
                Packages.net.xinshi.isone.modules.merchant.bean,
                Packages.net.xinshi.isone.functions.product
            );



            var mid = "head_merchant";

            var webName = SysArgumentService.getSysArgumentStringValue(mid,"col_sysargument","webName_cn")
            setPageDataProperty(pageData,"webName",webName);


            var userId = "";
            var user = LoginService.getFrontendUser();
            if(user){
                if(user.email){
                    setPageDataProperty(pageData,"emailReg",true);
                }
                if(user.mobilPhone){
                    setPageDataProperty(pageData,"mobileReg",true);
                }
                setPageDataProperty(pageData,"user",user);
            }


            var allRules = new selfApi.ArrayList();
            var richGeneralRulePlan = selfApi.IsoneBusinessRuleEngineEx.registerPlanExecutor.getEffectiveRichGeneralRulePlan(selfApi.Global.HEAD_MERCHANT, selfApi.Behavior.register);
            var  executableRules = new selfApi.ArrayList();
            if(richGeneralRulePlan != null){
                executableRules = richGeneralRulePlan.getExecutableRules(); //当前方案对应的行为（注册、邮件激活、短信激活）的可执行规则
                if(!executableRules.isEmpty()){
                    allRules.addAll(executableRules);
                }
            }
            richGeneralRulePlan = selfApi.IsoneBusinessRuleEngineEx.registerPlanExecutor.getEffectiveRichGeneralRulePlan(selfApi.Global.HEAD_MERCHANT, selfApi.Behavior.email_activation);
            if(richGeneralRulePlan != null){
                executableRules = richGeneralRulePlan.getExecutableRules();
                if(!executableRules.isEmpty()){
                    allRules.addAll(executableRules);
                }
            }
            var ruleList = [];
            if(allRules.size() > 0){
                ruleList = $.java2Javascript(allRules);
            }
            if(ruleList.length > 0){
                for(var idx =0;idx <ruleList.length;idx++){
                    var rule = ruleList[idx];
                    rule.fBeginDate = DateUtil.getLongDate(rule.beginDate);
                    rule.fEndDate = DateUtil.getLongDate(rule.endDate);
                }
            }

            setPageDataProperty(pageData,"allRules",ruleList);

        } catch (e) {
            $.log(e);
        }
    });
})(dataProcessor);