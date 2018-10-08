//#import pigeon.js
//#import Util.js
//#import user.js
//#import login.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    var ret = {
        state: 'no'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var id = $.params["id"];
    if(id){
        var listSize = PreSaleRuleService.getPreSaleOrderListCount(id);
        if(listSize > 1){
            ret.msg = "该预售规则中已有商品被预定,不能删除。";
            out.print(JSON.stringify(ret));
            return;
        }
        var result = PreSaleRuleService.delete(id);
        if(result){
            ret.state = "ok";
        }else{
            ret.msg = "删除失败,请稍候再试!";
        }
    }
    out.print(JSON.stringify(ret));
})();