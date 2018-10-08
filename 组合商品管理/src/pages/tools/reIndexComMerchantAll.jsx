//#import Util.js
//#import login.js
//#import merchant.js
//#import $combiproduct:services/ComMerchantService.jsx

(function () {
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();
        if (!loginUserId || loginUserId == "") {
            out.print("no privilege");
            return;
        }

        var total = 0;

        var mSearchArgs = {
            "page": 1,
            "limit": 100,
            "page_size": 100,
            "fields": "merchantId"
        };
        var list = MerchantService.getMerchants(mSearchArgs);

        out.print("totalCount=" + JSON.stringify(list));
        var recordLists = list.recordList;
        if (recordLists) {
            for (var k = 0; k < recordLists.length; k++) {
                var merchantId = recordLists[k].merchantId;

                var id = ComMerchantService.getId(merchantId);

                ComMerchantService.buildIndex(id, merchantId);

                total++;
            }
        }

        out.print("total=" + total);
    } catch (e) {
        out.print("e=" + e);
    }

})();




