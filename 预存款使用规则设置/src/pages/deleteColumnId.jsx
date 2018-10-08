//#import Util.js
//#import login.js
//#import $PreDepositRuleSetting:services/PreDepositRuleSettingService.jsx

;
(function () {
    var result = {};
    try {

        var catId = $.params["catId"];

        var jArgs = PreDepositRuleSettingService.getArgs();
        if (!jArgs) {
            jArgs = {};
        }

        var newColumnIds = "";
        var columnIds = jArgs.columnIds;
        if (columnIds && columnIds != "") {
            var cIds = columnIds.split(",");
            for (var i = 0; i < cIds.length; i++) {
                var cid = cIds[i];
                if (cid == catId) {
                    continue;
                }

                if (newColumnIds != "") {
                    newColumnIds += "," + cid;
                } else {
                    newColumnIds = cid;
                }
            }
        } else {
            columnIds = catId;
        }
        jArgs.columnIds = newColumnIds;

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
