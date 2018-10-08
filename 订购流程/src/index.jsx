//#import Util.js
//#import doT.min.js
//#import session.js
var m = $.params.m;
(function(){
    var backBuyerId = SessionService.getSessionValue("backBuyerId",request);
    var template = $.getProgram(appMd5,"client/cartsApp.html");
    var pageData = {merchantId:m,m:m,backBuyerId:backBuyerId};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

