//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
//#import @handlers/util.jsx
//#import merchantRights.js
(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }

    var apps = AppService.getIndependentApps(m,0,-1);
    var ruleApps = MerchantRightsService.getAvailableApps(m);
    if(ruleApps){
        apps = apps.concat(ruleApps);
    }

    var templateApps = [];

    var effectiveAppIds = AppEditorService.getEffectiveTemplates(m);
    if(!effectiveAppIds){
        effectiveAppIds = {};
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
       if(meta.appEditor && meta.appEditor.enabled){
           templateApps.push(app);
       }
       var pos = effectiveAppIds.indexOf(app.id);
       if(pos>=0){
           effectiveApps[pos] = app;
       }
    });


    var template = $.getProgram(appMd5,'pages/listTemplates.jsxp');
    var pageData = {apps:templateApps,m:m,effectiveApps:effectiveApps};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();