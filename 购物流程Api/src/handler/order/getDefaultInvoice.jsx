//#import Util.js
//#import invoice.js
//#import login.js
//#import session.js
(function () {
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin."};
        out.print(JSON.stringify(ret));
        return;
    }
    try {
        var defaultInvoice = InvoiceService.getDefaultInvoice(userId);
        var ret = {};
        ret.state = "ok";
        ret.defaultInvoice = defaultInvoice;
        out.print(JSON.stringify(ret));
    }catch(e) {
        out.print(e);
    };


})();