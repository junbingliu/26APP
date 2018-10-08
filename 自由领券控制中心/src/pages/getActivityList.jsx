//#import Util.js
//#import DateUtil.js
//#import $freeGetCardControl:services/FreeGetCardService.jsx

(function () {
    var merchantId = $.params.merchantId || "head_merchant";
    var ret = {};
    var activityList = FreeGetCardService.getActivityList(merchantId, 0, -1);
    for (var i = 0; i < activityList.length; i++) {
        var jActivity = activityList[i];

        var longBeginTime = new Date(jActivity.beginTime);
        var longEndTime = new Date(jActivity.endTime);

        jActivity.beginTimeTxt = DateUtil.getLongDate(longBeginTime.getTime());
        jActivity.endTimeTxt = DateUtil.getLongDate(longEndTime.getTime());

        jActivity.beginTime = jActivity.beginTimeTxt.replace(/-/g, "/");
        jActivity.endTime = jActivity.endTimeTxt.replace(/-/g, "/");
    }
    ret.state = "ok";
    ret.activityList = activityList;
    out.print(JSON.stringify(ret));
})();