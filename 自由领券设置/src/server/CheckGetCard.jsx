//#import Util.js
//#import login.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx

;
(function () {
    var jResult = {};
    var userId = LoginService.getFrontendUserId();
    if (!userId || userId.trim() == "") {
        jResult.code = "101";
        jResult.msg = "请先登录";
        out.print(JSON.stringify(jResult));
        return;
    }

    var activityId = $.params["aid"];
    var cardBatchId = $.params["bid"];

    if(!activityId || activityId == "" || !cardBatchId || cardBatchId == ""){
        jResult.code = "102";
        jResult.msg = "参数错误";
        out.print(JSON.stringify(jResult));
        return;
    }

    var jActivity = FreeGetCardService.getActivity(activityId);
    jResult = FreeGetCardService.checkLimitAmount(jActivity, cardBatchId, userId);

    out.print(JSON.stringify(jResult));
})();

