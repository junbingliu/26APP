//#import Util.js
//#import login.js
//#import user.js
//#import open-merchant.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

(function () {
    var regionId = $.params.regionId;
    if(!regionId){
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return
    }
    var jSearchArgs = {};
    jSearchArgs.regionId = regionId;
    jSearchArgs.otherColumnId = "c_ole_store_100";//ole线下门店
    jSearchArgs.page = "1";
    jSearchArgs.page_size = "100";
    jSearchArgs.fields = "merchantId,name_cn";
    var result = OpenMerchantService.getMerchants(jSearchArgs);
    var allMerchants = result.merchants;
    var merchants = allMerchants.map(function (merchant) {
        var mer = {
            id: merchant.merchantId,
            name: merchant["name_cn"]
        };
        return mer;
    });
    H5CommonUtil.setSuccessResult(merchants);
})();