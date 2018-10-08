//#import Util.js
//#import artTemplate.js

var pageData = {};
var templateString = $.getProgram(appMd5, "about.html");
var pageFn = template.compile(templateString);
var html = pageFn(pageData);
out.print(html);