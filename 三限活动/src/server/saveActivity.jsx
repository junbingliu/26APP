//#import Util.js
//#import $limitActivity:services/limitActivity.jsx
var activity = {};
activity.id = $.params.id;
activity.name = $.params.name;
activity.numberPerUser = $.params.numberPerUser;
activity.code = $.params.code;
activity.beginTime = $.params.beginTime;
activity.endTime = $.params.endTime;
activity.productId = $.params.productId;
activity.numberPerActivity = $.params.numberPerActivity;

if(activity.id){
    LimitActivityService.updateActivity(activity.id,activity);
    var ret = {
        state:"ok"
    }
    out.print(JSON.stringify(ret));
}
else{
    var id =LimitActivityService.addActivity(activity);
    var ret = {
        state:"ok",
        id : id
    }
    out.print(JSON.stringify(ret));
}



