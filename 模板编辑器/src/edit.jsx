//#import Util.js
//#import artTemplate.js
//#import artTemplateHelper.js
//#import app.js
//#import merchantRights.js
//#import doT.min.js
(function(){
    var rappId = $.params.rappId;
    var rpageId = $.params.pageId;
    var m = $.params.m;
    var renderEngine = $.params.renderEngine;

    var apps = AppService.getIndependentApps(m,0,-1);
    var ruleApps = MerchantRightsService.getAvailableApps(m);
    if(ruleApps){
        apps = apps.concat(ruleApps);
    }
    var extraApps = [];
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
        if(meta.appEditor && meta.appEditor.isExtra){
            extraApps.push(app);
        }
    });

    var m = $.params.m;
    var source = $.getProgram(appMd5,"client/edit.html");
    var pageData = {rappId:rappId,rpageId:rpageId,m:m,renderEngine:renderEngine,extras :extraApps};
    var render = template.compile(source);

    out.print(render(pageData));
})();

