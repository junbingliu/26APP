//#import pigeon.js
//#import Util.js
//#import search.js
//#import UserUtil.js
//#import user.js  
//#import $inventoryManage:services/InventoryManageService.jsx

(function () {
    if (typeof ids == "undefined") {
        return;//do nothing
    }
    var idArray = ids.split(",");
    var docs = [];
    for (var i = 0; i < idArray.length; i++) {
        var id = idArray[i];
        var obj = InventoryManageService.getById(id);

        if (obj) {
            var doc = {};
            doc.keyword_text = obj.productId + "|" + obj.skuId + "|" + obj.sku + "|" + obj.merchantId + "|" + obj.productName;
            doc.id = obj.id;
            doc.productId = obj.productId;
            doc.skuId = obj.skuId;
            doc.sku = obj.sku;
            doc.merchantId = obj.merchantId;
            doc.productName_text = obj.productName;
            doc.createTime = obj.createTime;
            doc.ot = "invM_log";
            docs.push(doc);
        }
    }
    SearchService.index(docs, ids);
})();