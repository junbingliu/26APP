//#import doT.min.js
//#import Util.js
//#import $platformFeedbackServer:services/PlatformFeedbackService.jsx

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    if(!id || id == ""){
        out.print("参数错误");
        return;
    }

    var jRecord = LotteryEventManageService.getFeedback(id);
    if(!jRecord){
        out.print("不存在");
        return;
    }


    var pageData = {
        record: jRecord,
        merchantId: merchantId
    };

    var template = $.getProgram(appMd5, "pages/RecordDetail.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

