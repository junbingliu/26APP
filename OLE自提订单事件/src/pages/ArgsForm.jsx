//#import doT.min.js
//#import Util.js
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffArgService.jsx

;
(function () {

    var merchantId = $.params["m"];

    var activityId = "";
    var merchantIds = "";
    var beginDateTime = "";
    var endDateTime = "";

    var jArgs = DirectFirstOrderHalfOffArgService.getArgs();
    if (jArgs) {
        if (jArgs.activityId) activityId = jArgs.activityId;
        if (jArgs.merchantIds) merchantIds = jArgs.merchantIds;
        if (jArgs.beginDateTime) beginDateTime = jArgs.beginDateTime;
        if (jArgs.endDateTime) endDateTime = jArgs.endDateTime;
    }

    var template = $.getProgram(appMd5, "pages/ArgsForm.jsxp");
    var pageData = {
        merchantId: merchantId,
        activityId: activityId,
        merchantIds: merchantIds,
        beginDateTime: beginDateTime,
        endDateTime: endDateTime
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

