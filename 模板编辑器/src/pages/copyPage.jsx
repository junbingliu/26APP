//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js

var m = $.params.m;
var rappId = $.params.rappId;
var pageId = $.params.pageId;


var page = AppEditorService.getPageById(m,rappId,pageId);
page.pageId = pageId + "_" + $.getId("pages");

page.url = 0;

var rapp = AppService.getApp(rappId);

//AppEditorService.savePage(m,rappId,page);

var template = $.getProgram(appMd5,'pages/copyPage.jsxp');
var pageData = {page:page,rappId:rappId,m:m,origPageId:pageId,rapp:rapp};
var fn = doT.template(template);
var html = fn(pageData);
out.print(html);

