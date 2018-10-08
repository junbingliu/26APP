//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    if(!m){
        m= $.getDefaultMerchantId();
    }
    var template = $.getProgram(appMd5,"home.jsxp");
    var pageData = {m:m};
    var fn = doT.template(template);
    var html = fn(pageData);
    out.print(html);
})();

