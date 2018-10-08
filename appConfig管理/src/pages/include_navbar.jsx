//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js

(function () {
    var source = $.getProgram(appMd5, "pages/include_navbar.jsxp");

    var merchantId = $.params["m"];
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var pageData = {m: merchantId};
    var render = template.compile(source);
    out.print(render(pageData));
})();

