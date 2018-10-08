//#import Util.js
//#import open-merchant.js

(function () {
    
    var jSearchArgs = {};
    jSearchArgs.otherColumnId = "c_ole_store_100";
    jSearchArgs.page = "1";
    jSearchArgs.page_size = "100";
    jSearchArgs.fields = "merchantId,name_cn,merchantCode";
    var result = OpenMerchantService.getMerchants(jSearchArgs);
    var allMerchants = result.merchants;
    var merchants = allMerchants.map(function (merchant) {
        var mer = {
            id: merchant.merchantId,
            name: merchant["name_cn"],
            code: merchant["merchantCode"]
        };
        return mer;
    });
	
	var ret = {};
	ret.code = "0";
	ret.merchants = merchants;
	out.print(JSON.stringify(ret));
    
})();