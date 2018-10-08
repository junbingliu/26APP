//#import Util.js
//#import login.js
//#import $yunruanInterface:services/YunruanArgService.jsx

;
(function () {
    var result = {};
    try {

        var appSecret = $.params["appSecret"];
        var getMemberByOpenIdUrl = $.params["getMemberByOpenIdUrl"];
        var getCodeByOpenId = $.params["getCodeByOpenId"];
        var getCodeByOpenIdUrl = $.params["getCodeByOpenIdUrl"];
        var toActOauthUrl = $.params["toActOauthUrl"];
        var oleAppSecret = $.params["oleAppSecret"];
        var oleToActOauthUrl = $.params["oleToActOauthUrl"];

        var jArgs = {};
        if (appSecret) {
            jArgs.appSecret = appSecret;
        }
        if (getMemberByOpenIdUrl) {
            jArgs.getMemberByOpenIdUrl = getMemberByOpenIdUrl;
        }
        if (getCodeByOpenIdUrl) {
            jArgs.getCodeByOpenIdUrl = getCodeByOpenIdUrl;
        }
        if (toActOauthUrl) {
            jArgs.toActOauthUrl = toActOauthUrl;
        }
        if (oleAppSecret) {
            jArgs.oleAppSecret = oleAppSecret;
        }
        if (oleToActOauthUrl) {
            jArgs.oleToActOauthUrl = oleToActOauthUrl;
        }

        YunruanArgService.saveArgs(jArgs);

        result.code = "ok";
        result.msg = "保存成功";
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.code = "100";
        result.msg = "操作出现异常，请稍后再试";
        out.print(JSON.stringify(result));
    }
})();
