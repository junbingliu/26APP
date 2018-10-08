//#import Util.js
//#import doT.min.js
var m = $.params.m;
var template = $.getProgram(appMd5,'contentFrame.html');
var pageData = {m:m}
var fn = doT.template(template);
var html = fn(pageData);
out.print(html);