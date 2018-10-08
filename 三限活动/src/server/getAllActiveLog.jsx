//#import Util.js
//#import $limitActivity:services/limitActivity.jsx

var activityId = $.params.activityId;
var start = $.params.start;
var limit = $.params.limit;

if (isNaN(start)) {
    start = 0;
}
if (isNaN(limit)) {
    limit = -1;
}
var dateFormat = function (date, fmt) { //author: meizz
    var o = {
        "M+": date.getMonth() + 1, //月份
        "d+": date.getDate(), //日
        "h+": date.getHours(), //小时
        "m+": date.getMinutes(), //分
        "s+": date.getSeconds(), //秒
        "q+": Math.floor((date.getMonth() + 3) / 3), //季度
        "S": date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (date.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};
var list = LimitActivityService.getActivityLogs(activityId, start, limit);
for (var i = 0; i < list.length; i++) {
    var log = list[i];
    if (log) {
        var time = log.time;
        var d = new Date();
        d.setTime(log.time);
        var timeStr = dateFormat(d, "yyyy-MM-dd hh:mm:ss");
        out.print(log.id + ",'" + time + ",'" + timeStr + "," + log.logNumber + "," + log.oldNumber + "," + log.number + "," + log.productId + "," + log.activityId + "," + log.userId + "," + log.orderId + "<br>");
    }
}
