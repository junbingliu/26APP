//#import Util.js
//#import pageService.js
//#import app.js

;
(function () {
    var m = $.params.m;
    var rappId = $.params.rappId;
    var pageId = $.params.pageId;
    var templateId = $.params.templateId;
    var pageData = pageService.getMerchantPageData(m, rappId, pageId);
    var dependsOn = pageData["_dependsOn"];
    if(dependsOn){
        dependsOn.map(function(p){
            var pdata = pageService.getMerchantPageData(m, rappId, p);
            pageData[p] = pdata;
        });
    }
    var app = AppService.getApp(rappId);
    var template = $.getProgram(app.md5, templateId);
    var ret = {
        pageData: pageData,
        template: template
    };
    out.print(JSON.stringify(ret));
})();
