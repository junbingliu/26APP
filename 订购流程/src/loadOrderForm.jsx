//#import Util.js
//获取所有的orderFormExtras
//#import Util.js
//#import artTemplate.js
//#import app.js
//#import appEditor.js
//#import merchantRights.js

function getExtras(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    var apps = AppService.getIndependentApps(m,0,-1);
    var ruleApps = MerchantRightsService.getAvailableApps(m);
    if(ruleApps){
        apps = apps.concat(ruleApps);
    }
    var effectiveApps = [];
    apps.forEach(function(app){
        var metaString = $.getProgram(app.md5,"meta.json");
        if(!metaString){
            return ;
        }
        try {
            var meta = JSON.parse(metaString);
        }
        catch (e){
            var meta={};
        }
        if(meta.orderFormExtra && meta.orderFormExtra.enabled){
            app.meta = meta;
            effectiveApps.push(app);
        }
    });
    return effectiveApps;
};
var orderFormExtras = getExtras();
if(orderFormExtras){
    orderFormExtras.forEach(function(app){
        var js = $.getProgram(app.md5,"orderFormExtra.jsx");
        out.print(js);
        out.print("\n");
    });
}
var js = $.getProgram(appMd5,"loadOrderFormMain.jsx");
out.print(js);
