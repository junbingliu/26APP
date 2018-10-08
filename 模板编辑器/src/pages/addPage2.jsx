//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
(function(){
    var m = $.params['m'];
    var rappId = $.params.rappId;
    if(!m){
        m="m_100";
    }
    var templateIdx = $.params.templateIdx;

    var rapp = AppService.getApp(rappId);
    var meta = AppService.getAppMeta(rappId);
    var templates = meta.templates;
    var page = templates[templateIdx];
    if(page.initData){
        page.initDataString = JSON.stringify(page.initData);
    }
    page.pos = 100;
    page.pageId = "";
    var template = $.getProgram(appMd5,'pages/editPage.jsxp');
    var pageData = {page:page,rapp:rapp,rappId:rappId,m:m};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();