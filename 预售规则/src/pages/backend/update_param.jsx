//#import pigeon.js
//#import Util.js
//#import $preSaleRule:libs/preSaleRule.jsx
//#import artTemplate3.mini.js

(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    //取参数
    var initParam = PreSaleRuleService.getParam();
    //如果还没有初始化
    if(!initParam){
        initParam = {};
        initParam.msg = "<p><b>1.</b>买家拍下商品后必须在30分钟内成功支付定金，否则系统将自动关闭该订单，取消该交易。</p>"+
        "<p><b>2.</b>支付定金后，买家未如期支付尾款，或买家申请退款且根据《武商平台管理规则》"+
                                            "等相关规则判定为非卖家责任的，定金均不退还。 </p>"+
        "<p><b>3.</b>买家支付定金，并如期支付了尾款，若商家延迟发货且订单状态为\"交易关闭\"，"+
                                          "则除按照《武商平台管理规则》及相关规则处理外，同时商家需补偿买家，补偿金"+
        "额为买家已支付定金的同等金额。 </p>"+
        "<p><b>4.</b>买家支付定金，并如期支付了尾款，若商家延迟发货但订单状态为\"交易成功\"，"+
                                            "则按照《武商平台管理规则》及相关规则处理。</p>";
        PreSaleRuleService.initParam(initParam);
    }
    var source = $.getProgram(appMd5, "pages/backend/update_param.jsxp");
    var pageData = {m: m,initParam:initParam};
    var render = template.compile(source);
    out.print(render(pageData));
})();

