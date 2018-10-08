//#import Util.js
//#import login.js
//#import $globalSysArgsSetting:services/GlobalSysArgsService.jsx

;
(function () {
    var result = {};
    try {
        var userId = LoginService.getBackEndLoginUserId();
        if (!userId) {
            result.code = "100";
            result.msg = "请先登录";
            out.print(JSON.stringify(result));
            return;
        }

        var lotteryUrl = $.params["lotteryUrl"] || "";
        var otoEntityMerchantIds = $.params["otoEntityMerchantIds"] || "";
        var jigsawBgImages = $.params["jigsawBgImages"] || "";
        var jigsawAccess_token = $.params["jigsawAccess_token"] || "";

        var jArgs = {};
        jArgs.lotteryUrl = lotteryUrl;
        jArgs.otoEntityMerchantIds = otoEntityMerchantIds;
        jArgs.jigsawBgImages = jigsawBgImages;
        jArgs.jigsawAccess_token = jigsawAccess_token;

        GlobalSysArgsService.saveArgs(jArgs);

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
