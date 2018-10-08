//#import Util.js
//#import doT.min.js
(function(){
    var template = $.getProgram(appMd5,"client/index.html");
    var m = $.params.m;
    var pageData = {m:m};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

