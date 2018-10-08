//#import Util.js
//#import doT.min.js
//#import app.js
//#import appEditor.js
//#import @handlers/util.jsx


var pageVersion =  AppEditorService.getPageVersion(pageVersionId);
//检查该彩排页似乎否已经过期
var now = new Date().getTime();
var delta = now -  pageVersion.publishDate;
if(delta>=0 && delta < 4*3600*1000 ){
    AppEditorService.publishPageVersion(mid,rappId,pageVersionId);
}

