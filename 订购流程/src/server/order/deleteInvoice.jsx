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

    var id = $.params.id;

    if(id!='none'){
        InvoiceService.deleteInvoice(userId,id);
    }
    var ret = {
        state:'ok'
    }
    out.print(JSON.stringify(ret));
})();