//#import pigeon.js
//#import Util.js
//#import login.js
//#import artTemplate3.mini.js
//#import $realPayRec:libs/PaymentService.jsx

(function () {
    var ret = {
        state: 'no'
    };
    var merchantId = $.params["m"];//商家Id
    if(!merchantId){
        merchantId = $.getDefaultMerchantId();
    }
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var paymentList = PayInterfaceService.list(0, 10000);
    var source = $.getProgram(appMd5, "pages/realPayRec_list.jsxp");
    var pageData = {
        m: merchantId,
        appId: appId,
        paymentList:paymentList
    };

    var render = template.compile(source);
    out.print(render(pageData));
})();