//#import Util.js
//#import invoice.js
//#import login.js
//#import session.js
//#import @server/util/ErrorCode.jsx

;(function () {
    var ret = ErrorCode.S0A00000;
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }

    var id = $.params.id;
    if (id != 'none') {
        InvoiceService.deleteInvoice(userId, id);
    }
    out.print(JSON.stringify(ret));
})();