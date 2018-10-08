//#import pigeon.js
//#import Util.js
//#import artTemplate3.mini.js
//#import $getui:services/GetuiArgService.jsx

(function () {
    var source = $.getProgram(appMd5, "pages/common/include_navbar.jsxp");

    var m = $.params["m"];//商家Id
    if (!m) {
        m = $.getDefaultMerchantId();
    }
    var jArgs = GetuiArgService.getArgs(m);
    if (!jArgs) {
        jArgs = {};
    }
    var pageData = {
        m: m,
        isEnable: jArgs.isEnable || "Y",
        appId: jArgs.appId || "",
        appSecret: jArgs.appSecret || "",
        appKey: jArgs.appKey || "",
        masterSecret: jArgs.masterSecret || "",
        appId2: jArgs.appId2 || "",
        appSecret2: jArgs.appSecret2 || "",
        appKey2: jArgs.appKey2 || "",
        masterSecret2: jArgs.masterSecret2 || "",
        mIds: jArgs.mIds || ""
    };
    var render = template.compile(source);
    out.print(render(pageData));
})();

