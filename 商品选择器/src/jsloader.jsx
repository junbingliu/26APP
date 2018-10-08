//#import Util.js
//#import doT.min.js
(function(){
    var m = $.params.m;
    if(!m){
        m = $.getDefaultMerchantId();
    }
    var template = $.getProgram(appMd5,"main.jsx");
    template = template.replace('!M',m);
    out.print(template);
})();