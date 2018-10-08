//#import Util.js
//#import login.js
//#import $freeGetCardControl:services/FreeGetCardUtil.jsx

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
    jResult = FreeGetCardUtil.doGiveCard(userId, activityId, cardBatchId);

    out.print(JSON.stringify(jResult));
    return;
})();

