//#import Util.js
//#import SaasActionGroup.js
//#import merchantRights.js
//#import app.js

var merchant = $.params['m'];
if (!merchant) {
    merchant = 'm_100';
}

var apps = AppService.getIndependentApps(merchant, 0, -1);
var ruleApps = MerchantRightsService.getAvailableApps(merchant);
if(ruleApps){
    apps = apps.concat(ruleApps);
}
apps = apps.map(function (app) {
    var stockActionGroups = SaasActionGroupService.getStockActionGroups(app.md5, app.id);
    var customActionGroups = SaasActionGroupService.getCustomActionGroups(merchant, app.id);
    var actionGroups = [];
    if(stockActionGroups){
        actionGroups =  actionGroups.concat(stockActionGroups);
    }
    if(customActionGroups){
        actionGroups = actionGroups.concat(customActionGroups);
    }
    return {id: app.id, name: app.name, actionGroups: actionGroups};
});
var ret = {state: 'ok', apps: apps};
out.print(JSON.stringify(ret));