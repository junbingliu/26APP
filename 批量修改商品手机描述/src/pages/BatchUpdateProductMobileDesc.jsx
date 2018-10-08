//#import doT.min.js
//#import Util.js
//#import login.js

(function () {

    var userId = LoginService.getBackEndLoginUserId();
    if (!userId) {
        out.print("请先登录");
        return;
    }

    var merchantId = $.params["m"];

    var template = $.getProgram(appMd5, "pages/BatchUpdateProductMobileDesc.jsxp");
    var pageData = {
        merchantId : merchantId
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

