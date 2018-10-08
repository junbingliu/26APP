//#import pigeon.js
//#import Util.js
//#import product.js
//#import sku.js
//#import inventory.js
//#import sku-store.js
//#import jobs.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx

(function () {
    var m = $.params["m"];
    var merchantId = $.params["mid"];
    if(!merchantId){
        out.print("请输入mid");
        return;
    }
    var getSkuInventory = function (jProduct, jSku, isExchangeOMS) {
        if (!jSku || !jProduct) {
            return jProduct;
        }
        var skuId = jSku.id;
        jProduct.sku = jSku.skuId;
        jProduct.skuId = jSku.id;
        jProduct.zeroSellable = jSku.zeroSellable || "0";
        if (jProduct.zeroSellable == "1") {
            jProduct.zeroSellable = "是";
        } else {
            jProduct.zeroSellable = "否";
        }
        if (isExchangeOMS) {
            jProduct.isExchangeOMS = "是";
            var skuQty = SkuService.getSkuAllQuantity(skuId);
            if (skuQty) {
                var values = skuQty.values;
                if (values) {
                    jProduct.realAmount = values[defaultShipNode] == undefined ? "" : values[defaultShipNode];
                    jProduct.zeroSellableCount = values["zeroSellableCount"] == undefined ? "" : values["zeroSellableCount"];
                }
            }
        } else {
            jProduct.zeroSellableCount = InventoryService.getSkuZeroSellCount(jProduct.productId, jSku.id);//零负可卖
            jProduct.realAmount = ProductService.getRealAmount(jProduct.productId, jSku.id);//实际库存
            jProduct.isExchangeOMS = "<font color='red'>否</font>";
        }
        jProduct.sellableCount = InventoryService.getSkuSellableCount(jProduct.productId, jSku.id);//可卖数
        jProduct.freezeAmount = InventoryService.getSkuFreezeAmount(jProduct.productId, jSku.id);//冻结库存
        jProduct.securitySellableCount = InventoryService.getSecuritySellableCount(jProduct.productId, jSku.id);//安全可卖数（已减安全可卖数）
        return jProduct;
    };
    var resultList = [];

    var isExchangeOMS = OmsControlArgService.needExchangeToOms(merchantId);
    if (!isExchangeOMS) {
        out.print("不需要对接Oms");
        return;
    }

    var products = ProductService.getProductsOfColumn("c_10000", merchantId, 0, -1);
    for (var i = 0; i < products.length; i++) {
        var product = products[i];
        var productId = product.objId;
        var skus = ProductService.getSkus(productId);
        if (!skus) {
            continue;
        }
        var defaultShipNode = OmsControlArgService.getDefaultShipNode(product.merchantId) || "";
        if (skus.length > 1) {
            for (var p = 0; p < skus.length; p++) {
                var jSku = skus[p];
                var tmpProduct = JSON.parse(JSON.stringify(product));
                tmpProduct = getSkuInventory(tmpProduct, jSku, isExchangeOMS);
                OmsEsbProductService.updateSkuRealAmount(merchantId, productId, jSku.id, tmpProduct.realAmount + 1);
                var jobPageId = "task/doSendOnSkuQuantityToOMS.jsx";
                var when = (new Date()).getTime() + 5 * 1000;
                var postData = {
                    productId: productId,
                    merchantId: merchantId
                };
                JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);
                resultList.push(tmpProduct);
            }
        } else {
            product = getSkuInventory(product, skus[0], isExchangeOMS);
            resultList.push(product);

            OmsEsbProductService.updateSkuRealAmount(merchantId, productId, jSku.id, product.realAmount + 1);
            var jobPageId = "task/doSendOnSkuQuantityToOMS.jsx";
            var when = (new Date()).getTime() + 5 * 1000;
            var postData = {
                productId: productId,
                merchantId: merchantId
            };
            JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);
        }
    }

    out.print("商家：" + merchantId + ",加入到对接队列成功，size:" + products.length);
})();