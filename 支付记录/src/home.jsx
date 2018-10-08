//#import Util.js
(function(){
    /*var m = $.params['m'];
    if(!m){
        m = $.getDefaultMerchantId();
    }
    var template = $.getProgram(appMd5,"client/index.html");
    var m = $.params.m;
    var pageData = {m:m};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));*/
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    response.sendRedirect("pages/realPayRec_list.jsx?m=" + m);
})();



