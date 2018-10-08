//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js
//#import $openAPIManage:services/OpenAPIConfigService.jsx

(function () {
    var source = $.getProgram(appMd5, "pages/include_navbar.jsxp");

    var merchantId = $.params["m"];
    if (!merchantId) {
        merchantId = $.getDefaultMerchantId();
    }
    var jArgs = OpenAPIConfigService.getConfig();
    if (!jArgs) {
        jArgs = {};
    }
    var pageData = {
        m:merchantId,
        url: jArgs.url || "",
        token: jArgs.token || ""
    };
    var render = template.compile(source);
    out.print(render(pageData));
})();

