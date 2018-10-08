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
    var toMer = $.params['toMer'];
    if(!toMer){
        toMer = 'head_merchant';
    }

    var apps = AppService.getIndependentApps(m,0,-1);
    var ruleApps = MerchantRightsService.getAvailableApps(m);
    if(ruleApps){
        apps = apps.concat(ruleApps);
    }

    var templateApps = [];

    apps.forEach(function(app){
        var metaString = $.getProgram(app.md5,"meta.json");
        if(!metaString){
            return ;
        }
        var meta =  JSON.parse(metaString);
        if(meta.appEditor && meta.appEditor.enabled){
            templateApps.push(app);
        }
    });
    templateApps.forEach(function(app){
        var pages = AppEditorService.getPages(m,app.id);
        pages.forEach(function(page){
            AppEditorService.savePage(toMer,app.id,page);
            setDependsOn(toMer,app.id,page.pageId,page.dependsOn);
            var pageData = pageService.getMerchantPageData(m, app.id, page.pageId);
            saveMerchantPageData(toMer,app.id,page.pageId,pageData);
            var dependsOn = pageData["_dependsOn"];
            if (dependsOn) {
                dependsOn.map(function (p) {
                    var pdata = pageService.getMerchantPageData(m,  app.id, p);
                    saveMerchantPageData(toMer,app.id,p,pdata);
                });
            };
        });
    });

    out.print("ok");
})();