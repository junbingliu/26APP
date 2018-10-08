//#import Util.js


(function(processor){
    processor.on("all",function(pageData,dataIds,elems){
        var queryStr = request.getQueryString() + "";
        var redirectUrl = "/product.html";
        if(queryStr){
            redirectUrl += "?" + queryStr;
        }
        response.sendRedirect(redirectUrl);
        return;
    });
})(dataProcessor);