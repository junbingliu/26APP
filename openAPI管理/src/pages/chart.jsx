//#import DateUtil.js
//#import Util.js
//#import login.js
//#import artTemplate3.mini.js

(function () {
    var merchantId = $.params["m"];//商家Id
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }

    var source = $.getProgram(appMd5, "pages/chart.jsxp");
    var beginDate = DateUtil.getShortDate(new Date().getTime() - 2 * 24 * 60 * 60 * 1000);
    var endDate = DateUtil.getShortDate(new Date().getTime() + 24 * 60 * 60 * 1000);
    var pageData = {
        m: merchantId,
        appId: appId,
        beginDate: beginDate,
        endDate: endDate
    };

    var render = template.compile(source);
    out.print(render(pageData));
})();