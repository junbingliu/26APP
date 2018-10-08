//#import doT.min.js
//#import Util.js
//#import user.js
//#import DateUtil.js
//#import UserUtil.js
//#import file.js
//#import $IDCardLib:services/IDCardLibService.jsx


(function () {

    var merchantId = $.params["m"];
    var t = $.params["t"];

    var pageData = {
        merchantId: merchantId,
    };

    var template = $.getProgram(appMd5, "pages/RecordForm.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
