//#import Util.js
//#import invoice.js
//#import login.js
//#import session.js

;(function() {
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin."};
        out.print(JSON.stringify(ret));
        return;
    }

    var invoiceId = $.params.invoiceId;
    if(!invoiceId){
        var ret = {state: "err", msg: "no invoiceId"};
        out.print(JSON.stringify(ret));
        return;
    }
    InvoiceService.setDefaultInvoice(userId,invoiceId);
    var ret = {
        state:'ok'
    }
    out.print(JSON.stringify(ret));
})();