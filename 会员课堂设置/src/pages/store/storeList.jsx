//#import doT.min.js
//#import Util.js

(function () {
    try {

        var m = $.params.m;
        var pageData = {
            merchantId : m
        };
   
    var template = $.getProgram(appMd5, "pages/store/storeList.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
    }catch(e){
        out.print(e);
    }
})();

