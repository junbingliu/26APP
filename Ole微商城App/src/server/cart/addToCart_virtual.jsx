//#import Util.js
//#import product.js
//#import login.js
//#import DateUtil.js
//#import cart.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx
//#import $integralProductManage:services/IntegralRuleService.jsx

;(function () {
    var NormalBuyFlowApi = new JavaImporter(
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
    var ret = ErrorCode.S0A00000;
    try {
        var productId = $.params.productId;
        var skuId = $.params.skuId;
        var buyAmount = $.params.amount || 1;
        var buyNow = $.params.buyNow || "N";
        //var uid = LoginService.getFrontendUserId();  //这是顾客的id

        if (!productId) {
            ret = ErrorCode.E1M000000;
            out.print(JSON.stringify(ret));
            return;
        }
        /*if (!uid) {
            ret = ErrorCode.E1M000003;
            out.print(JSON.stringify(ret));
            return;
        }*/


        //1.如果skuId == null,则检查productId是否是没有颜色尺码的区别的商品
        var realSkuId = "";
        var skus = ProductService.getSkus(productId);
        if (!skuId) {
            var effctiveSku = [];
            skus.forEach(function (sku) {
                if (sku.isShow == "1") {
                    effctiveSku.push(sku);
                }
            });
            if (effctiveSku.length != 1) {
                //下面有多款商品，需要选择一款具体的商品
                ret = ErrorCode.cart.E1M050093;
                out.print(JSON.stringify(ret));
                return;
            }
            skuId = "" + skus[0].id;
            realSkuId = "" + skus[0].skuId;
        } else {
            skus.forEach(function (sku) {
                if (sku.id == skuId) {
                    realSkuId = "" + sku.skuId;
                }
            });
        }
        //2.检查库存
        var sellCount = NormalBuyFlowApi.OrderItemHelper.getSkuInventoryAmount(productId, skuId);
        if (sellCount < buyAmount) {
            //throw {state:"noInventory",msg:"库存不足。"};
            ret = ErrorCode.cart.E1M050094;
            out.print(JSON.stringify(ret));
            return;
        }

        var product = ProductService.getProduct(productId);
        if (!CartUtil.isOleMerchant(product.merchantId)) {
            return ErrorCode.cart.E1M050104;
        }
        var productVersionId = product["_v"];
        var publishState = ProductService.getPublishState(product);
        var isCanBeBuy = "" + ProductService.checkBuyStatus(product);
        if (isCanBeBuy != "") {
            ret = ErrorCode.cart.E1M050097;
            out.print(JSON.stringify(ret));
            return;
        }
        if (publishState == '0') {
            ret = ErrorCode.cart.E1M050098;
            out.print(JSON.stringify(ret));
            return;
        }
        var bigCart = CartService.getBigCart();
        var isAdded = false;
        if (buyNow == "Y") {
            //先将所有的全部设置成未选中
            CartService.setAllUnchecked(bigCart);
            var cartItem = CartService.findItem(bigCart, productId, skuId, "virtual");
            if(cartItem){
                cartItem.checked = true;//将当前item设置为选中
                cartItem.amount = buyAmount;
                isAdded = true;
            }
        } else {
            CartUtil.unCheckCartByType(bigCart, "common");//将普通购物车不选中
            CartUtil.unCheckCartByType(bigCart, "preSale");//将预售购物车全部不选中
        }
        CartService.updateBigCart(bigCart);//保存购物车
        if(!isAdded){
            //TODO:检查购物车中的数量，看看加起来是否有库存
            var jShoppingCart = NormalBuyFlowApi.IsoneOrderEngine.shoppingCart.getShoppingCart(request, response, true);
            var jItem = new NormalBuyFlowApi.JSONObject();
            jItem.put("merchantId", product.merchantId);
            jItem.put("cartType", "virtual");
            jItem.put("objType", "virtual");
            jItem.put("productId", productId);
            jItem.put("productVersionId", productVersionId);
            jItem.put("skuId", skuId);
            jItem.put("realSkuId", realSkuId);
            jItem.put("amount", buyAmount);
            jItem.put("checked", "true");
            jItem.put("deliveryWay", product["deliveryWay"] || "0");
            jItem.put("cardBatchId", product["cardBatchId"]);
            jItem.put("isVirtual", product["isVirtual"]);
            var integralRule = IntegralRuleService.getProductIntegralRule(productId);
            if (integralRule) {
                jItem.put("objType", "integral");
            }
            try {
                NormalBuyFlowApi.ShoppingCartUtil.addItem(jShoppingCart, jItem);
            } catch (e) {
                var msg = e + "";
                var msgs = msg.split(":");
                if (msgs.length > 2) {
                    msg = msgs[2];
                }
                ret = ErrorCode.E1M000002;
                ret.msg = msg;
                out.print(JSON.stringify(ret));
                return;
            }
            NormalBuyFlowApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(jShoppingCart);
        }
        ret.data = {
            count: CartUtil.getCountInCart()
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("加入虚拟商品购物车异常：" + e);
        ret = ErrorCode.E1M000002;
        var msg = e + "";
        var msgs = msg.split(":");
        if (msgs.length > 2) {
            ret.msg = msgs[2];
        }
        out.print(JSON.stringify(ret));
    }
})();