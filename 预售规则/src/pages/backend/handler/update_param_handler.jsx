//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import login.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function(){
    var ret = {
        state: 'no'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if(!loginUserId || loginUserId == ""){
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var appStr = $.params["appStr"];
    var param = JSON.parse(appStr);
    var isOk = PreSaleRuleService.updateParam(param);
    if (isOk) {
        ret.state = "ok";
        ret.msg = "修改成功";
    } else{
        ret.state = "no";
        ret.msg = "操作出现异常，请与管理员联系";
    }
    out.print(JSON.stringify(ret));
})();