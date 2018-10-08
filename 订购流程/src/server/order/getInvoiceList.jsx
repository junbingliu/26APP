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

    var list = InvoiceService.getUserInvoiceList(userId);
    var defaultInvoice = InvoiceService.getDefaultInvoice(userId);
    var defaultInvoiceId = null;
    if(defaultInvoice){
        defaultInvoiceId = defaultInvoice.id;
    }
    var ret = {
        state:'ok',
        list:list,
        defaultInvoiceId:defaultInvoiceId
    }
    out.print(JSON.stringify(ret));
})();