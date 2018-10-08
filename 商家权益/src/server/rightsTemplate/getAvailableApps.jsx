//#import Util.js
//#import app.js
//#import file.js

var m = $.params.m;
var apps = AppService.getIndependentApps(m,0,-1);

var allApps = [];
for(var i=0; i<apps.length;i++){
    var app = apps[i];
    var icon =  null;
    if(app.iconFileId){
        icon = FileService.getRelatedUrl(app.iconFileId,"");
    }
    var shellApp = {appId:app.id,name:app.name,icon:icon,description:''};
    allApps.push(shellApp);
}

var result = {
    state:'ok',
    apps:allApps
}

out.print(JSON.stringify(result));