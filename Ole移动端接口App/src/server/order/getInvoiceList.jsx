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

    var list = InvoiceService.getUserInvoiceList(userId);
    var defaultInvoice = InvoiceService.getDefaultInvoice(userId);
    var defaultInvoiceId = null;
    if (defaultInvoice) {
        defaultInvoiceId = defaultInvoice.id;
    }
    var invoiceList = [];
    if (list && list.length > 0) {
        for (var i = 0; i < list.length; i++) {
            var invoice = list[i];
            invoice = {
                id: invoice.id,
                invoiceTypeKey: invoice.invoiceTypeKey,
                invoiceTitle: invoice.invoiceTitle,
                taxCode: invoice.taxCode,
                invoiceContent: invoice.invoiceContent
            };
            invoiceList.push(invoice);
        }
    }
    ret.data = {
        invoiceList: invoiceList,
        defaultInvoiceId: defaultInvoiceId
    };
    out.print(JSON.stringify(ret));
})();