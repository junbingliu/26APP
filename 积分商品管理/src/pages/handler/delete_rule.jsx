//#import Util.js
//#import login.js
//#import $integralProductManage:services/IntegralRuleService.jsx
//#import $integralProductManage:services/IntegralRuleLogService.jsx
(function () {
    var ret = {
        "code": "0"
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        ret.code = "100";
        out.print(JSON.stringify(ret));
        return;
    }
    var id = $.params["id"];
    if (!id) {
        ret.msg = "参数不能为空";
        ret.code = "101";
        out.print(JSON.stringify(ret));
        return;
    }
    var ids = id.split(",");
    ids.forEach(function (ruleId) {
        var rule = IntegralRuleService.getById(id);
        if (rule) {
            IntegralRuleService.delete(rule.id);
            createLog(rule, loginUserId);
        }
    });
    out.print(JSON.stringify(ret));
})();

function createLog(rule, loginUserId) {
    rule.beginMoney = rule.money;
    rule.endMoney = rule.money;
    rule.beginJifen = rule.jifen;
    rule.endJifen = rule.jifen;
    rule.ruleId = rule.id;
    rule.createUserId = loginUserId;
    rule.operationType = "delete";
    IntegralRuleLogService.add(rule);
}