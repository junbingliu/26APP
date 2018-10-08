//#import Util.js
//#import pigeon.js

var skuId = $.params["skuId"];//SKU的内部ID
if (!skuId) {
    out.print("skuId不能为空!");
} else {
    var id = "skuStoreQuantity_" + skuId;

//A001,A002是长裤编码
    var jSkuQuantity = {
        id: id,
        values: {
            "A001": 100,
            "A002": 100
        }

    };

    saveObject(jSkuQuantity.id, jSkuQuantity);

    print("ok");
}