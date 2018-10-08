//#import doT.min.js
//#import Util.js

(function () {
    // out.print("1111111111111");
    //
    var merchantId = $.params["m"];

    var pageData = {
        merchantId: merchantId
    };
    var template = $.getProgram(appMd5, "pages/PushManagement/PushManagementPage.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

