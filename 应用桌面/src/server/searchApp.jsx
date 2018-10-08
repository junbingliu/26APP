//#import Util.js
//#import app.js
//#import file.js
//#import merchantRights.js
//#import login.js
//#import $shell20:service/service.jsx
//#import SaasRoleAssign.js

var merchant = $.params['m'];
if(!merchant){
    merchant = $.getDefaultMerchantId();
}
var userId = LoginService.getBackEndLoginUserId();
var apps = AppService.getIndependentApps(merchant,0,-1);
var ruleApps = MerchantRightsService.getAvailableApps(merchant);
if(ruleApps){
    apps = apps.concat(ruleApps);
}
apps = SaasRoleAssignService.filterByUserPrivilege(apps,merchant,userId);
var keyword = $.params.q;

var matchApps = [];
if(!keyword){
    matchApps = apps;
}
else{
    keyword = keyword.replace(" ", "|");
    var pattern = new RegExp(keyword);
    apps.forEach(function(app){
        if(pattern.test(app.name)){
            matchApps.push(app);
        }
    });
}
matchApps.forEach(function(app){
    if(app.iconFileId){
        icon = FileService.getRelatedUrl(app.iconFileId,"");
        app.icon = icon;
    }
});

var ret = {
    list:matchApps,
    count:matchApps.length,
    status:'ok'
}
out.print(JSON.stringify(ret));
