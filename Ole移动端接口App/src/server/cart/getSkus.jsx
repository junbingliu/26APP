//#import Util.js
//#import cart.js
//#import product.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var productId = $.params.id;//商品Id

    if (!productId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    try {
        var product = ProductService.getProduct(productId);
        var skus = ProductService.getSkus(productId);
        var inventoryAttrs = ProductService.getInventoryAttrs(product);
        var validSkus = [];
        if (skus.length > 1) {
            skus.forEach(function (sku) {
                //不显示默认的sku和isShow为False的sku
                if (!sku.isHead && sku.isShow == "1") {
                    var smallSku = {
                        skuId: sku.id,
                        erpCode: sku.skuId,
                        attrs: sku.attrs
                    };
                    validSkus.push(smallSku);
                }
            });
        } else if (skus.length == 1) {
            validSkus.push(skus[0]);
        }
        var validInventoryAttrs = [];
        if (inventoryAttrs && inventoryAttrs.length > 0) {
            inventoryAttrs.forEach(function (attr) {
                var validAttr = {
                    id: attr.id,
                    name: attr.name,
                    standardValues: attr.standardValues,
                    isInventoryProperty: attr.isInventoryProperty,
                    isSameStyleProperty: attr.isSameStyleProperty
                };
                validInventoryAttrs.push(validAttr);
            });
        }
        ret.data = {
            skus: validSkus,//sku列表
            inventoryAttrs: validInventoryAttrs//库存属性
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("获取商品" + productId + ",sku列表失败：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();