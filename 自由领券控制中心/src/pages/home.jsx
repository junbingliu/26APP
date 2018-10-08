//#import Util.js
//#import doT.min.js
(function () {
    var merchantId = $.params['m'];
    var template = $.getProgram(appMd5, "client/home.html");
    var pageData = {m: merchantId};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();
