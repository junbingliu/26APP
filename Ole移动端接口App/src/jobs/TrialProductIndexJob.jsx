//#import Util.js
//#import search.js
//#import $oleMobileApi:services/TrialProductService.jsx

/**
 * 试用商品索引Job
 * by fuxiao
 * email: fuxiao9@crv.com.cn
 */
;(function () {
    $.log("\n\n TrailProductIndexJob begin: \n\n");
    if (!ids) {
        return;//do nothing
    }
    var idArray = ids.split(",");
    var docs = [];
    idArray.forEach(function(id) {
        var trialProduct = TrialProductService.getObject(id);
        if (trialProduct) {
            var indexObject = {};
            indexObject.id = id;
            indexObject.productId = trialProduct.productId; // 试用商品ID
            indexObject.userId = trialProduct.userId; // 试用申请人ID
            indexObject.state = trialProduct.state;
            indexObject.activeId = trialProduct.activeId;
            indexObject.isHistory = trialProduct.isHistory;
            indexObject.createDate = trialProduct.createDate;
            indexObject.ot = "ole_trial_product_ot_index";
            docs.push(indexObject)
        }
    });
    SearchService.index(docs, ids);
    $.log("\n\n TrailProductIndexJob end: \n\n");
})();