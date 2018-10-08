//#import doT.min.js
//#import Util.js

(function () {
    var merchantId = $.params["m"];
    var activeId = $.params["activeId"];
    var productObjId = $.params["productObjId"];
    var pageData = {
        merchantId: merchantId
    };
    if(activeId){
        pageData.activeId = activeId;
    }else{
        pageData.activeId = "";
    }
    if(productObjId){
        pageData.productObjId = productObjId;
    }else{
        pageData.productObjId = "";
    }
    var template = $.getProgram(appMd5, "pages/newProduct.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();