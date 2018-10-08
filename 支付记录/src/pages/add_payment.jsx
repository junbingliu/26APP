//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js
//#import $realPayRec:libs/PaymentService.jsx

(function () {
    var m = $.params['m'];
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var id = $.params['id'];
    var source = $.getProgram(appMd5, "pages/add_payment.jsxp");

    var paymentList = PayInterfaceService.list(0, 10000);

    var render = template.compile(source);
    var pageData = {m: m,resultList:paymentList};
    out.print(render(pageData));
})();

