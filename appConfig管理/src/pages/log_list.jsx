//#import Util.js
//#import artTemplate3.mini.js

(function () {
    var merchantId = $.params["m"];//商家Id
    if(!merchantId){
        merchantId = $.getDefaultMerchantId();
    }

    var source = $.getProgram(appMd5, "pages/log_list.jsxp");
    var pageData = {
        m: merchantId,
        appId: appId
    };

    var render = template.compile(source);
    out.print(render(pageData));
})();