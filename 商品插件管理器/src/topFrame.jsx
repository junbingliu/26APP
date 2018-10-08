//#import Util.js
//#import artTemplate.js
//#import app.js
//#import appEditor.js
//#import merchantRights.js
(function(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    var frameId = $.params.frameId;
    var productId = $.params.productId;
    var apps = AppService.getIndependentApps(m,0,-1);
    //$.log(JSON.stringify(apps) + "\n");
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
        if(meta.productExtra && meta.productExtra.enabled){
            app.meta = meta;
            effectiveApps.push(app);
        }
    });
    //$.log(JSON.stringify(effectiveApps));
    var source = $.getProgram(appMd5,'topFrame.html');
    var pageData = {m:m,productId:productId,apps:effectiveApps,frameId:frameId}
    var fn = template.compile(source);
    var html = fn(pageData);
    out.print(html);
})();
