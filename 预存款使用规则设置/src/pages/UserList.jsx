//#import doT.min.js
//#import Util.js
//#import open-user.js

(function () {

    var merchantId = $.params["m"];


    var pageData = {
        merchantId: merchantId
    };

    var template = $.getProgram(appMd5, "pages/UserList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

