//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var activeId = $.params["activeId"];
    var pageData = {
        merchantId: merchantId
    };
    if(activeId){
        pageData.activeId = activeId;
    }else{
        pageData.activeId = "";
    }
    var template = $.getProgram(appMd5, "pages/activeEdit.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();