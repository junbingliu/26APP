//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var id = $.params['id'];
    var rule = PreSaleRuleService.getById(id);
    var ret = {};
    ret.state = "ok";
    if (!rule) {
        ret.state = "no";
        ret.msg = "取不ID为" + id + "的规则,请刷新后重试!";
        out.print(ret);
        return;
    }
    ret.data = rule;
    out.print(JSON.stringify(ret));
})();

