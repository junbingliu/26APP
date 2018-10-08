//#import doT.min.js
//#import Util.js
//#import $yunruanInterface:services/YunruanArgService.jsx

;
(function () {

    var merchantId = $.params["m"];

    var appSecret = "";//密钥
    var getMemberByOpenIdUrl = "";
    var getCodeByOpenIdUrl = "";
    var toActOauthUrl = "";

    var jArgs = YunruanArgService.getArgs();
    if (jArgs) {
        if (jArgs.appSecret) appSecret = jArgs.appSecret;
        if (jArgs.getMemberByOpenIdUrl) getMemberByOpenIdUrl = jArgs.getMemberByOpenIdUrl;
        if (jArgs.getCodeByOpenIdUrl) getCodeByOpenIdUrl = jArgs.getCodeByOpenIdUrl;
        if (jArgs.toActOauthUrl) toActOauthUrl = jArgs.toActOauthUrl;
    }

    var template = $.getProgram(appMd5, "pages/ArgsForm.jsxp");
    var pageData = {
        merchantId: merchantId,
        getMemberByOpenIdUrl: getMemberByOpenIdUrl,
        getCodeByOpenIdUrl: getCodeByOpenIdUrl,
        toActOauthUrl: toActOauthUrl,
        appSecret: appSecret,
        oleToActOauthUrl: jArgs.oleToActOauthUrl || "",
        oleAppSecret: jArgs.oleAppSecret || ""
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

