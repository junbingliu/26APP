//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
//#import date-zh-CN.js
//#import @handlers/util.jsx

var m = $.params.m;
var rappId = $.params.rappId;
var origPageId = $.params.origPageId;
var rapp = AppService.getApp(rappId);
var meta = AppService.getAppMeta(rappId);
var pageVersions = AppEditorService.getPageVersions(m,rappId,origPageId, 0, 50);
pageVersions.forEach(function(pageVersion){
    pageVersion.publishDateString = (new Date(pageVersion.publishDate)).toString("yyyy-MM-dd HH:mm");
    if(pageVersion.lastPublishedDate){
        pageVersion.lastPublishedDateString= (new Date(pageVersion.lastPublishedDate)).toString("yyyy-MM-dd HH:mm");
    }
    else{
        pageVersion.lastPublishedDateString = "";
    }
});
var origPage = AppEditorService.getPageById(m,rappId,origPageId);

var pageData = {m:m,rappId:rappId,origPageId:origPageId,pageVersions:pageVersions,rapp:rapp,origPage:origPage}
if(meta.renderEngine){
        pageData.renderEngine=meta.renderEngine;
}
var template = $.getProgram(appMd5,'pages/listPageVersions.jsxp');
var fn = doT.template(template);
var html = fn(pageData);
out.print(html);