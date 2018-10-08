//#import Util.js
//#import product.js
//#import $combiproduct:services/CombiProductService.jsx
//#import login.js
//#import normalBuy.js
//#import file.js
//#import $combiproductApi:tools/combiProduct.jsx
(function () {

    var Api = new JavaImporter(
        Packages.net.xinshi.isone.modules,
        Packages.net.xinshi.isone.modules.shoppingcart,
        Packages.net.xinshi.isone.commons,
        Packages.net.xinshi.isone.modules.order,
        Packages.org.json,
        Packages.net.xinshi.isone.modules.businessruleEx.plan,
        Packages.net.xinshi.isone.functions.shopping,
        Packages.net.xinshi.isone.modules.businessruleEx.plan.bean.executeTimeBean,
        Packages.net.xinshi.isone.modules.order.bean
    );

    var ret = {};
    try {
        var json = $.params.p;
        var spec = $.params.spec || "60X60";
        if (!json || json == "") {
            ret.state = "err";
            ret.msg = "参数错误";
            out.print(JSON.stringify(ret));
            return;
        }
        $.log("\n............................json="+json);
        var uid = LoginService.getFrontendUserId();  //这是顾客的id
        if (uid == "") {
            uid = "-1";
        }

        var jUserSelection = JSON.parse(json);
        var combiProductId = jUserSelection.combiProductId;
        var parts = jUserSelection.parts;

        //这是组合商品
        var combiProduct = CombiProductService.getCombiProduct(combiProductId);
        if (!combiProduct) {
            ret.state = "err";
            ret.msg = "组合商品不存在";
            out.print(JSON.stringify(ret));
            return;
        }
        var combiMerchantId = combiProduct.merchantId;

        //计算总价
        var priceRec = CombiProductService.getPrice(combiProduct, uid);
        //distributePrice(combiProduct, parts, priceRec);
        CombiProduct.distributePrice(combiProduct, parts, priceRec);
        $.log("\n............................parts="+JSON.stringify(parts));

        var icon = "";
        if (combiProduct.fileIds && combiProduct.fileIds.length > 0) {
            icon = FileService.getRelatedUrl(combiProduct.fileIds[0], spec);
        }

        var item = {
            merchantId: combiMerchantId,
            cartType: "common",
            productId: combiProductId,
            productVersionId: "hd",
            skuId: "hd",
            realSkuId: "",
            amount: 1,
            checked: true,
            isCombiProduct: true,
            combiProductId: combiProductId,
            productName: combiProduct.title,
            icon: icon,
            totalPrice: combiProduct.totalPrice,
            unitPrice: combiProduct.totalPrice,
            columnIds: combiProduct.columnIds,
            subItems: []
        };

        for (var idxItems = 0; idxItems < parts.length; idxItems++) {
            var productItem = parts[idxItems];
            var product = ProductService.getProduct(productItem.productId);
            var merchantId = product.merchantId;
            var productVersionId = product["_v"];
            var skuId = productItem.skuId;
            var realSkuId = "";

            var skus = ProductService.getSkus(productItem.productId);
            skus.forEach(function (sku) {
                if (sku.id == skuId) {
                    realSkuId = "" + sku.skuId;
                }
            });

            var subItem = {
                merchantId: merchantId,
                cartType: "common",
                productId: productItem.productId,
                productVersionId: productVersionId,
                skuId: skuId,
                realSkuId: realSkuId,
                amount: productItem.amount,
                checked: true,
                isCombiProduct: true,
                combiProductId: combiProductId,
                unitPrice: productItem.unitPrice,
                totalPrice: productItem.totalPrice
            };
            item.subItems.push(subItem);

        }
        var jsonItem = $.JSONObject(item);
        var jsonSubProducts = jsonItem.optJSONArray("subItems");
        var sellableAmount = Api.OrderItemHelper.getFreeGroupInventoryAmount(jsonSubProducts);

        CartService.deleteShoppingCart();//先清除掉购物车
        var jShoppingCart = Api.IsoneOrderEngine.shoppingCart.getShoppingCart(request, response, true);
        Api.ShoppingCartUtil.addItem(jShoppingCart, jsonItem);

        //遍历shoppingcart 检查combiProduct,看看数量够不够
        for (var i = 0; i < item.subItems.length; i++) {
            var subItem = item.subItems[i];
            var buyAmount = Api.ShoppingCartUtil.getAmountInCart(subItem.productId, subItem.skuId, merchantId, jShoppingCart, "common");
            var sellableCount = Api.OrderItemHelper.getCommonSkuInvAmount(subItem.productId, subItem.skuId);
            if (buyAmount > sellableCount) {
                var product = ProductService.getProduct(subItem.productId);

                ret.state = "err";
                ret.msg = "'" + product.name + "'库存不足.";
                out.print(JSON.stringify(ret));
                return;
            }
        }
        Api.IsoneOrderEngine.shoppingCart.updateShoppingCart(jShoppingCart);

        ret.state = "ok";
        out.print(JSON.stringify(ret));
    }
    catch (e) {
        $.log(e);
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

function distributePrice(combiProduct, parts, priceRec) {
    //var productItems = parts;
    //var originTotal = 0;
    //productItems.forEach(function (productItem) {
    //    originTotal += 1000;
    //});
    //var ratio = priceRec.price / originTotal;
    //var total = 0;
    //productItems.forEach(function (productItem) {
    //    productItem.unitPrice = 1000;
    //    productItem.totalPrice = 1000;
    //    total += Number(productItem.totalPrice);
    //});

}

