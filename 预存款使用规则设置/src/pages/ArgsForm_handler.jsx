//#import Util.js
//#import login.js
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx

;
(function () {
    var result = {};
    try {

        var catId = $.params["catId"];
        var isEnableRule = $.params["isEnableRule"];

        var jArgs = PreDepositRuleSettingService.getArgs();
        if (!jArgs) {
            jArgs = {};
        }

        if(catId){
            var columnIds = jArgs.columnIds;
            if (columnIds && columnIds != "") {
                var isExist = false;
                var cIds = columnIds.split(",");
                for (var i = 0; i < cIds.length; i++) {
                    var cid = cIds[i];
                    if (cid == catId) {
                        isExist = true;
                    }
                }

                if (!isExist) {
                    if (columnIds != "") {
                        columnIds += "," + catId;
                    } else {
                        columnIds = catId;
                    }
                }
            } else {
                columnIds = catId;
            }
            jArgs.columnIds = columnIds;
        }

        if(isEnableRule){
            jArgs.isEnableRule = isEnableRule;
        }

        PreDepositRuleSettingService.saveArgs(jArgs);

        result.code = "ok";
        result.msg = "保存成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
