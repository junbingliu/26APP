//#import doT.min.js
//#import Util.js
//#import $oleTrialReport:services/TrialReportService.jsx
(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"] || "";

    var params = {id: id};
    var trialReportList = TrialReportUtilService.get(params, "like", "", 1, 0);

    var obj = trialReportList.list[0];

    var pageData = {
        merchantId: merchantId,
        obj: obj
    };
    var template = $.getProgram(appMd5, "pages/reportDetail.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();