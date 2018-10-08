//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
//#import date-zh-CN.js
(function(){
    var m = $.params['m'];
    var rappId = $.params.rappId;
    if(!m){
        m="m_100";
    }
    var rapp = AppService.getApp(rappId);
    var pageId = $.params.pageId;
    var pageVersionId = $.params.pageVersionId;
    var page = AppEditorService.getPageVersion(pageVersionId);
    if(page && page.publishDate){
        var publishDateString = (new Date(page.publishDate)).toString("yyyy-MM-dd HH:mm:ss");
        page.publishDateString = publishDateString;
    }
    var template = $.getProgram(appMd5,'pages/editPageVersion.jsxp');
    var pageData = {page:page,rapp:rapp,rappId:rappId,m:m,pageId:pageId};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();