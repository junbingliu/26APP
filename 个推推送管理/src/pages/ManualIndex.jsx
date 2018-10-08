//#import doT.min.js
//#import Util.js
//#import login.js
(function () {
    var merchantId = $.params["m"];
    var loginUserId = LoginService.getBackEndLoginUserId();
    if (!loginUserId || loginUserId == "") {
        out.print("请先登录后再操作");
        return;
    }

    var pageData = {
        merchantId: merchantId
    };

    var template = $.getProgram(appMd5, "pages/ManualIndex.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

