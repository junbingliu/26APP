//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js

var m = $.params.m;
var rappId = $.params.rappId;
var pageId = $.params.pageId;
var origPageId = $.params.origPageId;
if(!origPageId){
    origPageId = pageId;
}


var page = AppEditorService.getPageById(m,rappId,pageId);
page.pageId = pageId + "_" + $.getId("pages");

var rapp = AppService.getApp(rappId);

var template = $.getProgram(appMd5,'pages/copyPageVersion.jsxp');
var pageData = {page:page,rappId:rappId,m:m,origPageId:origPageId,rapp:rapp};
var fn = doT.template(template);
var html = fn(pageData);
out.print(html);

