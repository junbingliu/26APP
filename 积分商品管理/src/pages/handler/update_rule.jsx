//#import Util.js
//#import login.js
//#import $integralProductManage:services/priceUtil.jsx
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
    var data_str = $.params["data"];
    if (!data_str) {
        ret.msg = "参数不能为空";
        ret.code = "101";
        out.print(JSON.stringify(ret));
        return;
    }
    var data = JSON.parse(data_str);
    data.money = PriceUtil.trim(data.money);
    data.jifen = PriceUtil.trim(data.jifen);
    if (!data.money || data.money === "") {
        ret.msg = "现金不能为空";
        ret.code = "104";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!PriceUtil.isNumber(data.money)) {
        ret.msg = "现金必须为数字";
        ret.code = "105";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!data.jifen || data.jifen === "") {
        ret.msg = "积分值不能为空";
        ret.code = "102";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!PriceUtil.isNumber(data.jifen)) {
        ret.msg = "积分值必须为数字";
        ret.code = "103";
        out.print(JSON.stringify(ret));
        return;
    }

    var id = data.id;
    var old_rule = IntegralRuleService.getById(id);
    data = mergeRule(old_rule, data);
    data.operationType = "update";
    IntegralRuleService.update(data.id, data);
    createLog(old_rule, data, loginUserId);
    out.print(JSON.stringify(ret));
})();

function createLog(old_rule, integral_rule, createUserId) {
    integral_rule.beginMoney = old_rule && old_rule.money || "0";
    integral_rule.endMoney = integral_rule.money;
    integral_rule.beginJifen = old_rule && old_rule.jifen || "0";
    integral_rule.endJifen = integral_rule.jifen;
    integral_rule.createUserId = createUserId;
    delete integral_rule.createTime;
    IntegralRuleLogService.add(integral_rule);
}


function mergeRule(old_rule, new_rule) {
    var result = null;
    if (!old_rule) {
        return result;
    }
    if (!new_rule) {
        return old_rule;
    }
    var keys = Object.keys(new_rule);
    result = JSON.parse(JSON.stringify(old_rule));
    keys.forEach(function (key) {
        var value = new_rule[key];
        result[key] = value;
    });
    return result;
}