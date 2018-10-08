//#import Util.js
//#import merchantAccounts.js
//#import login.js
//#import doT.min.js
//#import merchant.js
//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params['m'];
    if(!m){
        m = $.getDefaultMerchantId();
    }
    var template = $.getProgram(appMd5,"client/index.html");
    var m = $.params.m;
    var pageData = {m:m};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();



