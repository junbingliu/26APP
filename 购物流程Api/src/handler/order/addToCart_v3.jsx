//#import Util.js
//#import product.js
//#import $combiproduct:services/CombiProductService.jsx
//#import login.js
//#import normalBuy.js
//#import file.js
//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx
//#import $integralMall:libs/integralRule.jsx

;(function () {

    var Api = new JavaImporter(
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.shoppingcart,
        Packages.net.xinshi.isone.commons,
        Packages.net.xinshi.isone.modules.order,
        Packages.org.json,
        Packages.net.xinshi.isone.modules.businessruleEx.plan,
        Packages.net.xinshi.isone.functions.shopping,
        Packages.net.xinshi.isone.modules.businessruleEx.plan.bean.executeTimeBean,
        Packages.net.xinshi.isone.modules.businessruleEx,
        Packages.net.xinshi.isone.modules.order.bean
    );
    try {
        var productId = $.params.productId;
        var skuId = $.params.skuId;
        var objType = $.params.objType || "";
        //$.log("\n\n addToCart_v3 productId = "+productId+" \n\n\n\n\n");
        var amount = $.params.amount || 1;
        var uid = LoginService.getFrontendUserId();  //这是顾客的id
        var spec = $.params.spec;
        var buyingDevice = $.params.buyingDevice || "mobile";
        if (uid == "") {
            uid = "-1";
        }
        var resellerId = $.params.resellerId;//这是分销员的userId

        var merId = $.params.merId;
        if (!resellerId && merId) {
            var merResellerId = MerchantService.getApplyUserIdByMerchantId(merId);
            if (merResellerId) {
                resellerId = merResellerId;
            }
        }
        if (resellerId == 'market') {
            resellerId = 'market';
        }
        if (productId.indexOf("combiProduct") > -1) {
            //这是组合商品
            var combiProduct = CombiProductService.getCombiProduct(productId);
            var merchantId = combiProduct.merchantId;
            //计算总价
            var productIds = [];
            combiProduct.productItems.forEach(function (productItem) {
                productIds.push(productItem.productId);
            });
            var products = ProductService.getProducts(productIds, "160X160");
            var productMap = {};
            products.forEach(function (product) {
                if (!productMap[product.objId]) {
                    productMap[product.objId] = product;
                }
            });
            var priceRec = CombiProductService.getPrice(combiProduct, uid);
            CombiProductService.distributePrice(combiProduct, priceRec);
            var icon = "";
            if (combiProduct.fileIds && combiProduct.fileIds.length > 0) {
                var icon = FileService.getRelatedUrl(combiProduct.fileIds[0], spec);
            }
            var item = {
                merchantId: merchantId,
                cartType: "common",
                productId: productId,
                productVersionId: "hd",
                skuId: "hd",
                realSkuId: "",
                amount: amount,
                checked: true,
                isCombiProduct: true,
                combiProductId: productId,
                productName: combiProduct.title,
                icon: icon,
                totalPrice: combiProduct.totalPrice,
                unitPrice: combiProduct.totalPrice,
                columnIds: combiProduct.columnIds,
                resellerId: resellerId,
                subItems: []
            };
            for (var idxItems = 0; idxItems < combiProduct.productItems.length; idxItems++) {
                var productItem = combiProduct.productItems[idxItems];
                // var product = ProductService.getProduct( productItem.productId );
                var product = productMap[productItem.productId];
                var merchantId = product.merchantId;
                var productVersionId = product["_v"];
                var realSkuId = "";
                var skuId = "";
                if (productItem.skuIds && productItem.skuIds.length > 0) {
                    skuId = productItem.skuIds[0];
                }
                var skus = ProductService.getSkus(productItem.productId);
                var realSkuId = "";

                if (!skuId) {
                    if (skus.length != 1) {
                        //下面有多款商品，需要选择一款具体的商品
                        ret = {state: "needSkuId", msg: "有多款子商品，需要选择一款具体的商品购买。"};
                        out.print(JSON.stringify(ret));
                        return;
                    }
                    skuId = "" + skus[0].id;
                    realSkuId = "" + skus[0].skuId;
                }
                else {
                    skus.forEach(function (sku) {
                        if (sku.id == skuId) {
                            realSkuId = "" + sku.skuId;
                        }
                    });
                }

                var unitWeight = 0;
                if (!isNaN(product.weight)) {
                    unitWeight = Number(product.weight) * 1000;
                }

                var unitVolume = 0;
                if (!isNaN(product.volume)) {
                    unitVolume = Number(product.volume) * 1000;
                }

                var subItem = {
                    merchantId: merchantId,
                    cartType: "common",
                    productId: productItem.productId,
                    productName: product.name,
                    productVersionId: productVersionId,
                    skuId: skuId,
                    realSkuId: realSkuId,
                    amount: productItem.num,
                    checked: true,
                    isCombiProduct: true,
                    combiProductId: productId,
                    unitPrice: productItem.unitPrice,
                    totalPrice: productItem.totalPrice,
                    unitWeight: unitWeight,
                    unitVolume: unitVolume,
                    icon: product.logo
                }
                item.subItems.push(subItem);
            }
            ;
            var jsonItem = $.JSONObject(item);
            var jsonSubProducts = jsonItem.optJSONArray("subItems");
            var sellableAmount = Api.OrderItemHelper.getFreeGroupInventoryAmount(jsonSubProducts);
            var jShoppingCart = Api.IsoneOrderEngine.shoppingCart.getShoppingCart(request, response, true);
            Api.ShoppingCartUtil.addItem(jShoppingCart, jsonItem);
            //遍历shoppingcart 检查combiProduct,看看数量够不够
            for (var i = 0; i < item.subItems.length; i++) {
                var subItem = item.subItems[i];
                var buyAmount = Api.ShoppingCartUtil.getAmountInCart(subItem.productId, subItem.skuId, merchantId, jShoppingCart, "common");
                var sellableCount = Api.OrderItemHelper.getCommonSkuInvAmount(subItem.productId, subItem.skuId);
                if (buyAmount > sellableCount) {
                    var product = ProductService.getProduct(subItem.productId);
                    var ret = {
                        state: "err",
                        msg: "'" + product.name + "'库存不足."
                    }
                    out.print(JSON.stringify(ret));
                    return;
                }
            }
            CartService.populatePrices(jShoppingCart, uid, 0, true);
            Api.IsoneBusinessRuleEngineEx.buyFlowPlanExecutor.executePlans(jShoppingCart, uid, 0, true);
            //$.log("\n\n addToCart_v3 jShoppingCart = "+jShoppingCart+" \n\n\n\n\n");
            Api.IsoneOrderEngine.shoppingCart.updateShoppingCart(jShoppingCart);
        } else {
            var product = ProductService.getProduct(productId);
            var merchantId = product.merchantId;
            var jBigCart;
            try {
                if (!objType) {
                    jBigCart = NormalBuyFlowService.addToCartEx(productId, skuId, amount, uid, merchantId, false, null, null, resellerId, buyingDevice);
                } else {
                    if (objType === "integral") {
                        jBigCart = NormalBuyFlowService.addIntegralToCartEx(productId, skuId, amount, uid, merchantId, false, null, null, resellerId, objType, buyingDevice);
                    }
                }

            } catch (error) {
                out.print(JSON.stringify(error));
                return;
            }
            CartService.populatePrices(jBigCart, uid, 0, true);
            Api.IsoneBusinessRuleEngineEx.buyFlowPlanExecutor.executePlans(jBigCart, uid, 0, true);
            CartService.calculateDeliveryRulesForAll(jBigCart, uid);
            Api.IsoneOrderEngine.shoppingCart.updateShoppingCart(jBigCart);
        }
        out.print(JSON.stringify({state: "ok"}));
    }
    catch (e) {
        if (e.state == 'noInventory') {
            out.print(JSON.stringify({state: "err", msg: product.name + "库存不足"}));
        }
        else {
            var msg = "";
            if (e && e.msg) {
                msg = e.msg;
            }
            else {
                try {
                    msg = e.getMessage();
                }
                catch (err) {
                    msg = e.toString();
                    var msgs = msg.split(":");
                    if (msgs.length > 2) {
                        msg = msgs[2];
                    }
                }
            }
            out.print(JSON.stringify({state: "err", msg: product && product.name + msg}));
        }
    }
})();