//#import Util.js
//#import doT.min.js
(function(){
    var url = $.params.url;
    var rappId = $.params.appId;
    var rpageId = $.params.pageId;
    var m = $.params.m;
    var template = $.getProgram(appMd5,"client/index.html");
    var pageData = {url:url,rappId:rappId,rpageId:rpageId,m:m};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

