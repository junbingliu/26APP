//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var id = $.params["id"];
    var pageData = {
        merchantId: merchantId
    };
    if(id){
        pageData.id = id;
    }else{
        pageData.id = "";
    }
    var template = $.getProgram(appMd5, "pages/reportEdit.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();