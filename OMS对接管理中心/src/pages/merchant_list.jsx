//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js

(function () {
    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var source = $.getProgram(appMd5, "pages/merchant_list.jsxp");
    var pageData = {
        m: m,
        appId: appId
    };

    var render = template.compile(source);
    out.print(render(pageData));
})();