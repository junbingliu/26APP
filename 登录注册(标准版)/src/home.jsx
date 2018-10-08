//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    /*var template = $.getProgram(appMd5,"home.jsxp");
    var pageData = {appId:appId,m:m};
    var pageFn = doT.template(template);
    var html = pageFn(pageData);
    out.print(html);*/
    response.sendRedirect("/appEditor/pages/listPages.jsx?m=" + m + "&rappId=" + appId);
})();