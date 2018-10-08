//#import Util.js
//#import artTemplate.js
(function(){
    var m = $.params['m'];
    if(!m){
        m = $.getDefaultMerchantId();
    }
    var templateSource = $.getProgram(appMd5,"client/index.html");
    var renderer = template.compile(templateSource);
    var html = renderer({m:m});
    out.print(html);
})();

