//#import doT.min.js
//#import Util.js
//#import DateUtil.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx

;
(function () {
    var merchantId = $.params["m"];
    var isOmsExchange = "";
    var isEsbExchange = "";
    var beginTime = "";
    var omsEsbUrl = "";

    var jArgs = OmsControlArgService.getMerchantArgs(merchantId);
    if (jArgs) {
        if (jArgs.isOmsExchange) isOmsExchange = jArgs.isOmsExchange;
        if (jArgs.isEsbExchange) isEsbExchange = jArgs.isEsbExchange;
        if (jArgs.omsEsbUrl) omsEsbUrl = jArgs.omsEsbUrl;
        if (jArgs.beginTime) beginTime = DateUtil.getLongDate(jArgs.beginTime);
    }

    var template = $.getProgram(appMd5, "pages/ArgsForm.jsxp");
    var pageData = {
        merchantId: merchantId,
        isOmsExchange: isOmsExchange,
        isEsbExchange: isEsbExchange,
        omsEsbUrl: omsEsbUrl,
        beginTime: beginTime
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

