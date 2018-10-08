//#import artTemplate3.mini.js
//#import pigeon.js
//#import Util.js

(function(){
    var source = $.getProgram(appMd5, "pages/include_base.jsxp");
    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var pageData = {"m":m};
    var render = template.compile(source);
    out.print(render(pageData));
})();