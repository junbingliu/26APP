//#import Util.js
//#import invoice.js
//#import login.js
//#import session.js

;(function () {
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin."};
        out.print(JSON.stringify(ret));
        return;
    }

    var id = $.params.id;
    var invoiceTitleType = $.params.invoiceTitleType;//抬头类型  个人,单位
    var invoiceTitle = $.params.invoiceTitle;
    var invoiceContent = $.params.invoiceContent;
    var invoicePostAddress = $.params.invoicePostAddress || "";
    var invoiceTypeKey = $.params.invoiceTypeKey || "com";//com:普通,vat:增值税
    var invoiceType = "普通发票";
    var invoiceUserName = $.params.invoiceUserName;
    var invoicePhone = $.params.invoicePhone;
    var invoiceCertificate = $.params.invoiceCertificate;
    var certificate = $.params.certificate;
    var address = $.params.address;
    var bank = $.params.bank;
    var account = $.params.account;
    var needInvoice = "不需要";
    if (invoiceTitleType) {
        needInvoice = "需要";
        needInvoiceKey = "yes";
        invoiceKey = "yes";
    } else {
        needInvoiceKey = "no";
        invoiceKey = "no";
    }
    if (invoiceTypeKey === "vat") {
        invoiceContent = "";
        invoiceContent += "注册地址:" + address;
        invoiceContent += "开户银行:" + bank;
        invoiceContent += "银行账户:" + account;
        invoiceType = "增值税发票";
        invoiceUserName = "";
        invoicePhone = "";
        certificate = "";
        invoiceCertificate = "";
        invoiceTitleType = "";
    } else {
        if (invoiceTitleType === "个人") {
            invoiceTitle = "";
            invoiceCertificate = "";
        } else {
            invoiceUserName = "";
            invoicePhone = "";
            certificate = "";
        }
    }
    var invoice = {
        id: id,
        invoiceTitle: invoiceTitle,
        invoiceTitleType: invoiceTitleType,
        invoiceContent: invoiceContent,
        invoiceTypeKey: invoiceTypeKey,
        invoicePostAddress: invoicePostAddress,
        needInvoiceKey: needInvoiceKey,
        invoiceKey: invoiceKey,
        invoiceUserName: invoiceUserName,
        invoicePhone: invoicePhone,
        needInvoice: needInvoice,
        invoiceCertificate: invoiceCertificate,
        certificate: certificate,
        invoiceType: invoiceType
    };
    $.log("\n\n\n\n\n\n invoice = " + JSON.stringify(invoice) + " \n\n\n\n\n\n")
    if (!id || id == 'newInvoice') {
        id = InvoiceService.addInvoice(userId, invoice);
    }
    else {
        InvoiceService.updateInvoice(id, invoice);
    }
    InvoiceService.setDefaultInvoice(userId, id);
    var ret = {
        state: 'ok'
    };
    out.print(JSON.stringify(ret));
})();