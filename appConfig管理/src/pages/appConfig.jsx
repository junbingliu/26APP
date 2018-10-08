//#import Util.js
//#import artTemplate3.mini.js

(function () {
    var merchantId = $.params["m"];//商家Id
    var type = $.params["type"] || "wj";//商家Id
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }

    var source = $.getProgram(appMd5, "pages/appConfig.jsxp");
    var pageData = {
        m: merchantId,
        type: type,
        appId: appId
    };

    var render = template.compile(source);
    out.print(render(pageData));
})();