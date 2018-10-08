//#import Util.js
//#import login.js
//#import open-merchant.js
//#import $paymentSetting:services/paymentSettingService.jsx

;
(function () {
    var uid = LoginService.getBackEndLoginUserId();
    var keyword = $.params.keyword || "";
    var start = Number($.params.start);
    var limit = Number($.params.limit);

    var curPage = Number(start/limit) + 1;
    var page_size = limit;

    var jSearchArgs = {};
    jSearchArgs.keyword = keyword;
    jSearchArgs.page = curPage;
    jSearchArgs.page_size = page_size;
    jSearchArgs.fields = "merchantId,name_cn";
    var result = OpenMerchantService.getMerchants(jSearchArgs);
    var allMerchants = result.merchants;
    var merchants = allMerchants.map(function(merchant){
        var mer = {
            id : merchant.merchantId,
            name:merchant["name_cn"],
            inheritPlatform:PaymentSettingService.getInheritPlatform(merchant.merchantId)
        };
        return mer;
    });

    var ret = {
        state: "ok",
        merchants: merchants,
        total: result.total
    };
    out.print(JSON.stringify(ret));

})();