//#import Util.js
//#import invoice.js
//#import login.js
//#import session.js
//#import @server/util/ErrorCode.jsx

;(function () {
    var ret = ErrorCode.S0A00000;
    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }

    var invoiceId = $.params.invoiceId;
    if (!invoiceId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    InvoiceService.setDefaultInvoice(userId, invoiceId);
    out.print(JSON.stringify(ret));
})();