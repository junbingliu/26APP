//#import Util.js
//#import login.js
//#import user.js
//#import open-merchant.js


(function () {
    var ret = {state: "error", msg: ""};
    var regionId = $.params.regionId;
    if (!regionId) {
        ret.msg = "区域ID不能为空"
        out.print(JSON.stringify(ret));
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
    ret.msg = "获取成功";
    ret.merchants = merchants;
    out.print(JSON.stringify(ret));
})();