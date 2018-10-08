//#import doT.min.js
//#import Util.js
//#import $globalSysArgsSetting:services/GlobalSysArgsService.jsx

(function () {


    var merchantId = $.params["m"];

    var lotteryUrl = "";
    var otoEntityMerchantIds = "";
    var jigsawBgImages = "";
    var jigsawAccess_token = "";

    var jArgs = GlobalSysArgsService.getArgs();
    if (jArgs) {
        if (jArgs.lotteryUrl) lotteryUrl = jArgs.lotteryUrl;
        if (jArgs.otoEntityMerchantIds) otoEntityMerchantIds = jArgs.otoEntityMerchantIds;
        if (jArgs.jigsawBgImages) jigsawBgImages = jArgs.jigsawBgImages;
        if (jArgs.jigsawAccess_token) jigsawAccess_token = jArgs.jigsawAccess_token;
    }

    var template = $.getProgram(appMd5, "pages/ArgsForm.jsxp");
    var pageData = {
        merchantId: merchantId,
        jigsawBgImages: jigsawBgImages,
        jigsawAccess_token: jigsawAccess_token,
        otoEntityMerchantIds: otoEntityMerchantIds,
        lotteryUrl: lotteryUrl
    };
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

