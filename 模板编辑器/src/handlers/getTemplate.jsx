//#import Util.js
//#import app.js

var m = $.params.m;
var rappId= $.params.rappId;
var templateId = $.params.templateId;
var app = AppService.getApp(rappId);
var template = $.getProgram(app.md5,templateId);
template =  "" + $.processImportUrl(template,"data-type","fdata-type");
var ret = {state:"ok",template:template};
out.print(JSON.stringify(ret));
