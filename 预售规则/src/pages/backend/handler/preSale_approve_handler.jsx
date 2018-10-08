//#import Util.js
//#import login.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    var ret = {
        state: 'no'
    };
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var ids = $.params["ids"];
    var approveState = $.params["approveState"];
    if (!ids || !approveState) {
        ret.msg = "请求参数不能为空。";
        out.print(JSON.stringify(ret));
        return
    }
    var array = ids.split(",");
    for (var i = 0; i < array.length; i++) {
        var id = array[i];
        var oldRule = PreSaleRuleService.getById(id);
        if (!oldRule) {
            ret.msg = "Id参数错误。";
            continue;
        }
        if (oldRule.approveState != "0") {
            ret.msg = "该规则不是未审核状态，不能审核。";
            continue;
        }
        oldRule.approveState = approveState;//修改审核状态
        oldRule.approveUserId = loginUserId;//审核人id
        oldRule.approveTime = new Date().getTime();//审核时间
        PreSaleRuleService.approve(oldRule, approveState);
    }

    ret.msg = "操作成功。";
    ret.state = "ok";
    out.print(JSON.stringify(ret));
})();
