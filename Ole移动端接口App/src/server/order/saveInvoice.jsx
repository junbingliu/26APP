//#import Util.js
//#import invoice.js
//#import login.js
//#import session.js
//#import @server/util/ErrorCode.jsx

;(function () {
    var ret = ErrorCode.S0A00000;
    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }

    var id = $.params.id;
    var invoiceTitleType = $.params.invoiceTitleType || "单位";
    var invoiceTitle = $.params.invoiceTitle;
    var invoiceContent = $.params.invoiceContent;
    var invoicePostAddress = $.params.invoicePostAddress || "";
    var invoiceTypeKey = $.params.invoiceTypeKey || "";
    var invoiceKey = "yes";
    if (invoiceTitle == '无需发票') {
        invoiceKey = "no";
    }
    var invoice = {
        id: id,
        invoiceTitle: invoiceTitle,
        invoiceTitleType: invoiceTitleType,
        invoiceContent: invoiceContent,
        invoiceTypeKey: invoiceTypeKey,
        invoicePostAddress: invoicePostAddress,
        invoiceKey: invoiceKey
    };
    if (!id || id == 'newInvoice') {
        id = InvoiceService.addInvoice(userId, invoice);
    } else {
        InvoiceService.updateInvoice(id, invoice);
    }
    InvoiceService.setDefaultInvoice(userId, id);
    out.print(JSON.stringify(ret));
})();