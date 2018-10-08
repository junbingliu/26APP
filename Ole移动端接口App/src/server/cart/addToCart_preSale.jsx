//#import Util.js
//#import product.js
//#import login.js
//#import DateUtil.js
//#import PreSale.js
//#import cart.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx

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
        var rule = PreSaleService.getProductPreSaleRule(productId);
        if (!rule) {
            ret = ErrorCode.cart.E1M050096;
            out.print(JSON.stringify(ret));
            return;
        }
        //增加预售状态判断，如果未审核通过的预售规则，不能购买
        if (rule.approveState == "0" || rule.approveState == "-1") {
            ret = ErrorCode.cart.E1M050103;
            out.print(JSON.stringify(ret));
            return;
        }
        var nowTime = DateUtil.getNowTime();//现在时间

        var depositBeginLongTime = rule.depositBeginLongTime;//定金开始支付时间
        var depositEndLongTime = rule.depositEndLongTime;//定金结束支付时间
        var beginLongTime = rule.beginLongTime;//尾款开始支付时间
        var endLongTime = rule.endLongTime;//尾款结束支付时间

        //预售未开始也能加入购物车
        if(nowTime < depositBeginLongTime){
//            ret = ErrorCode.cart.E1M050102;
//            out.print(JSON.stringify(ret));
//            return;
        }

        var preSaleState = "0";//默认为0,表示还没开始支付定金
        if (nowTime > depositBeginLongTime) {
            preSaleState = "1";//预售定金开始支付时间已过
            //ret.msg = "开始支付定金";
        }
        if (nowTime > depositEndLongTime) {
            preSaleState = "2";//预售定金结束支付时间已过,定金支付时间已过
            ret.msg = "定金支付时间已过";
            ret = ErrorCode.cart.E1M050101;
            out.print(JSON.stringify(ret));
            return;
        }
        if (nowTime > beginLongTime) {
            preSaleState = "3";//预售尾款开始支付时间已过
            ret.msg = "开始支付尾款";
            ret = ErrorCode.cart.E1M050099;
            out.print(JSON.stringify(ret));
            return;
        }
        if (nowTime > endLongTime) {
            preSaleState = "4";//预售尾款结束支付时间已过,尾款支付时间已过
            ret.msg = "尾款支付时间已过";
            ret = ErrorCode.cart.E1M050100;
            out.print(JSON.stringify(ret));
            return;
        }
        ret.preSaleState = preSaleState;

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
            var cartItem = CartService.findItem(bigCart, productId, skuId, "preSale");
            if(cartItem){
                cartItem.checked = true;//将当前item设置为选中
                cartItem.amount = buyAmount;
                isAdded = true;
            }
        } else {
            CartUtil.unCheckCartByType(bigCart, "common");//将普通购物车不选中
        }
        CartService.updateBigCart(bigCart);//保存购物车
        /*var smallCart = CartService.getCartByType(product.merchantId, "preSale");
        if (smallCart) {
            for (var key in smallCart.items) {
                var cartItem = smallCart.items[key];
                if (cartItem.productId != productId || cartItem.skuId != skuId) {
                    CartService.removeCartByType(product.merchantId, "preSale");//将原来的预售购物车删除
                    break;
                }
            }
        }*/
        if(!isAdded){
            //TODO:检查购物车中的数量，看看加起来是否有库存
            var jShoppingCart = NormalBuyFlowApi.IsoneOrderEngine.shoppingCart.getShoppingCart(request, response, true);
            var jItem = new NormalBuyFlowApi.JSONObject();
            jItem.put("merchantId", product.merchantId);
            jItem.put("cartType", "preSale");
            jItem.put("objType", "preSale");
            jItem.put("productId", productId);
            jItem.put("productVersionId", productVersionId);
            jItem.put("skuId", skuId);
            jItem.put("realSkuId", realSkuId);
            jItem.put("amount", buyAmount);
            jItem.put("checked", "true");
            jItem.put("cardBatchId", product["cardBatchId"]);
            jItem.put("isVirtual", product["isVirtual"]);
            //如果现在还没有开始支付定金，那么就不能选中去结算
            if(preSaleState == "0"){
                jItem.put("checked", "false");
            }
            NormalBuyFlowApi.ShoppingCartUtil.addItem(jShoppingCart, jItem);
            NormalBuyFlowApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(jShoppingCart);
            if (product && product.temperatureControl) {
                CartUtil.unCheckByTemperatureControl(bigCart, "preSale", product.temperatureControl);//根据温控属性，将购物车全部反选
            }
        }
        ret.data = {
            count: CartUtil.getCountInCart()
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("加入预售商品购物车异常：" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();