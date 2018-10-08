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
    var rapp = AppService.getApp(rappId);
    var pages = AppEditorService.getPages(m,rappId);
    var pageId = $.params.pageId;
    var curPage = null;
    for(var i=0; i<pages.length; i++){
        var page = pages[i];
        if(page.pageId == pageId){
            curPage = page;
        }
    }
    var template = $.getProgram(appMd5,'pages/editPage.jsxp');
    var pageData = {page:curPage,rapp:rapp,rappId:rappId,m:m,pageId:pageId};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();