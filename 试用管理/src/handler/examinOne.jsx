//#import Util.js
//#import login.js
//#import $oleTrialReport:services/TrialReportService.jsx

/**
 * 这里是调用沈超的审核试用报告的方法
 */
;(function () {

    var examineUserId = LoginService.getBackEndLoginUserId();
    var id = $.params.id || "";
    var option = $.params.option || "1";
    var examineReason = $.params.examineReason || "";
    var result  = TrialReportUtilService.examineOne(examineUserId,id,option,examineReason);
    if(result){
        out.print(JSON.stringify({param:"ok",result:result}));
    }
})();