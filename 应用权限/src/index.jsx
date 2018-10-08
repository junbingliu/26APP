//#import Util.js
//#import doT.min.js
var m = $.params.m;
(function(){
    var template = $.getProgram(appMd5,"client/index.html");
    var pageData = {merchantId:m};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

