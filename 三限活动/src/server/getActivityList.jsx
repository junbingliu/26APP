//#import Util.js
//#import pigeon.js
//#import $limitActivity:services/limitActivity.jsx

var productId = $.params.productId;
var start = $.params.start;
var limit = $.params.limit;

if(isNaN(start)){
    start = 0;
}
if(isNaN(limit)){
    limit = 50;
}
var list = LimitActivityService.getActivities(productId,start,limit);

var total = LimitActivityService.getNumberActivities(productId);

list.forEach(function(activity){
   activity.activityBoughtNumber = LimitActivityService.getActivityBoughtNumber(activity.id);
});
var ret = {
    state : "ok",
    activities : list,
    total:total
}
out.print(JSON.stringify(ret));

