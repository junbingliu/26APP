//#import Util.js
//#import app.js
//#import file.js
//#import GraphicsUtils.js

var appIds = $.params.appIds;
var name = $.params.name;

var appIdsArr = appIds.split(",");
var apps =AppService.getAppsByIds(appIdsArr);

var iconFileIds = [];
for(var i=0; i<apps.length; i++){
    iconFileIds.push(apps[i].iconFileId);
}
var newIconFileId = "" + GraphicsService.combine("",iconFileIds.join(","),"80X80");
var iconFileUrl = "" + FileService.getRelatedUrl(newIconFileId,"");
var ret = {
    state:"ok",
    iconFileId:newIconFileId,
    iconFileUrl :iconFileUrl
}
out.print(JSON.stringify(ret));


