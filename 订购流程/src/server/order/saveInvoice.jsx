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
    var invoiceTitle = $.params.invoiceTitle;
    var invoiceContent = $.params.invoiceContent;
    var invoicePostAddress = $.params.invoicePostAddress;
    var invoiceTypeKey = $.params.invoiceTypeKey;
    var invoiceKey = "yes";
    if(invoiceTitle=='无需发票'){
        invoiceKey = "no";
    }
    var invoice = {
        id:id,
        invoiceTitle:invoiceTitle,
        invoiceTitleType:"单位",
        invoiceContent:invoiceContent,
        invoiceTypeKey:invoiceTypeKey,
        invoicePostAddress:invoicePostAddress,
        invoiceKey:invoiceKey
    };
    if(!id || id=='newInvoice'){
        var id = InvoiceService.addInvoice(userId,invoice);
    }
    else{
        InvoiceService.updateInvoice(id,invoice);
    }
    InvoiceService.setDefaultInvoice(userId,id);
    var ret = {
        state:'ok'
    };
    out.print(JSON.stringify(ret));
})();