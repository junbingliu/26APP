//#import Util.js
//#import $limitActivity:services/limitActivity.jsx

var activityId = $.params.activityId;
var start = $.params.start;
var limit = $.params.limit;

if(isNaN(start)){
    start = 0;
}
if(isNaN(limit)){
    limit = 50;
}
var list = LimitActivityService.getActivityLogs(activityId,start,limit);
var size = LimitActivityService.getActivityLogSize(activityId);

var ret = {
    state:"ok",
    logs:list,
    total:size
};
out.print(JSON.stringify(ret));
