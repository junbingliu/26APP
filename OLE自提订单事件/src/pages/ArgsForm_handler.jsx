//#import Util.js
//#import login.js
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffArgService.jsx
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffLogService.jsx

;
(function () {
    var result = {};
    try {

        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "100";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }

        var activityId = $.params["activityId"];
        var merchantIds = $.params["merchantIds"];
        var beginDateTime = $.params["beginDateTime"];
        var endDateTime = $.params["endDateTime"];

        var longContent = "";
        var jArgs = DirectFirstOrderHalfOffArgService.getArgs();
        if(!jArgs){
            jArgs = {};
        }
        if (activityId) {
            longContent += "活动ID修改前【" + (jArgs.activityId || "") + "】";
            longContent += "活动ID修改后【" + activityId + "】";
            jArgs.activityId = activityId;
        }
        if (merchantIds) {
            longContent += "<br>适用的商家ID修改前【" + (jArgs.merchantIds || "") + "】";
            longContent += "适用的商家ID修改后【" + merchantIds + "】";
            jArgs.merchantIds = merchantIds;
        }
        if (beginDateTime) {
            var btUpdateBefore = "";
            var btUpdateAfter = "";
            if (jArgs.beginDateTime) {
                btUpdateBefore = DateUtil.getLongDate(jArgs.beginDateTime);
            }
            if (beginDateTime) {
                btUpdateAfter = DateUtil.getLongDate(beginDateTime);
            }
            longContent += "<br>下单开始时间修改前【" + btUpdateBefore + "】";
            longContent += "下单开始时间修改后【" + btUpdateAfter + "】";
            jArgs.beginDateTime = beginDateTime;
        }
        if (endDateTime) {
            var etUpdateBefore = "";
            var etUpdateAfter = "";
            if (jArgs.endDateTime) {
                etUpdateBefore = DateUtil.getLongDate(jArgs.endDateTime);
            }
            if (endDateTime) {
                etUpdateAfter = DateUtil.getLongDate(endDateTime);
            }
            longContent += "<br>下单结束时间修改前【" + etUpdateBefore + "】";
            longContent += "下单结束时间修改后【" + etUpdateAfter + "】";
            jArgs.endDateTime = endDateTime;
        }

        DirectFirstOrderHalfOffArgService.saveArgs(jArgs);

        DirectFirstOrderHalfOffLogService.addLog("update", "", userId, longContent);

        result.code = "ok";
        result.msg = "保存成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        //$.log("..............................ArgsForm_handler.jsx...error=" + e);
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
