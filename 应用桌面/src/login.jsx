//#import doT.min.js
//#import pigeon.js
//#import Util.js

var template = $.getProgram(appMd5, "client/modules/login/login.html");
var pageFn = doT.template(template);
var pageData = {};
out.print(pageFn(pageData));