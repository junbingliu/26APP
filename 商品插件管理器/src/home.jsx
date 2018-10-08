//#import Util.js
//#import doT.min.js
var m = $.params.m;
var productId = $.params.productId ;
var template = $.getProgram(appMd5,'home.html');
var frameId = "f" + new Date().getTime();
var pageData = {m:m,productId:productId,frameId:frameId};
var fn = doT.template(template);
var html = fn(pageData);
out.print(html);