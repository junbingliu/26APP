//#import doT.min.js
//#import Util.js

(function(){
    var template = $.getProgram(appMd5, "pages/common/include_base.jsxp");
    var pageData = {};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();