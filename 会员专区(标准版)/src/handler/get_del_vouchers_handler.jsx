//#import Util.js
//#import pigeon.js
//#import product.js
//#import sku.js
//#import code2product.js
//#import login.js
//#import inventory.js
//#import merchant.js
//#import card.js
//#import cart.js
//#import $delVoucherBindProduct:services/DelVoucher.jsx

(function () {
    try {
        CartService.deleteShoppingCart();//删除整个购物车
    } catch (e) {
    }
    var ret = {};
    ret.state = "ok";
    ret.msg = "获取成功";

    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        ret.state = "no";
        ret.msg = "用户未登录";
        out.print(JSON.stringify(ret));
        return;
    }
    var cardNumber = $.params["cardNumber"];
    var password = $.params["password"];
    var m = $.params["m"];
    if (!cardNumber) {
        ret.state = "no";
        ret.msg = "券号不能为空";
        out.print(JSON.stringify(ret));
        return;
    }
    if (!password) {
        ret.state = "no";
        ret.msg = "密码不能为空";
        out.print(JSON.stringify(ret));
        return;
    }

    var jCard = CardService.getCardByNumber("cardType_coupons", cardNumber.trim());
    if (!jCard) {
        ret.state = "no";
        ret.msg = "券号或密码错误!";
        out.print(JSON.stringify(ret));
        return;
    }
    //如果密码长度小于8位,那就在前面补0
    if (password.length < 8) {
        var addCount = 8 - password.length;
        for (var i = 0; i < addCount; i++) {
            password = "0" + password;
        }
    }
    var check = CardService.checkCardPassword(jCard, password.trim());
    if (!check || check == "false") {
        ret.state = "no";
        ret.msg = "券号或密码错误!";
        out.print(JSON.stringify(ret));
        return;
    }
    if (jCard.canceled && jCard.canceled == "1") {
        ret.state = "no";
        ret.msg = "此券已做废,不能使用!";
        out.print(JSON.stringify(ret));
        return;
    }
    //验证成功后,绑定卡到会员并将卡号对应的商品加入购物车
    //未绑定的需要绑定
    if (!jCard.bound || jCard.bound == "0") {
        var jResult = CardService.bindCard2User(jCard.id, userId);
        if (!jResult || !jResult.success || jResult.success == "false") {
            ret.state = "no";
            ret.msg = jResult.msg || "绑定券给会员失败,请与管理员联系";
            out.print(JSON.stringify(ret));
            return;
        }
    } else {
        if (jCard.boundUserId != userId) {
            ret.state = "no";
            ret.msg = "此券已被他人使用!";
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var cardBatchId = jCard.cardBatchId;
    if (!cardBatchId) {
        ret.state = "no";
        ret.msg = "此券对应券批次ID为空,请联系管理员!";
        out.print(JSON.stringify(ret));
        return;
    }

    var obj = DelVoucherService.getById(DelVoucherService.getNewId(cardBatchId));
    if (!obj) {
        ret.state = "no";
        ret.msg = "该券没有配置对应的提货规则!";
        out.print(JSON.stringify(ret));
        return;
    }
    var productIds = [];
    var jItems = obj.items;
    for (var i = 0; i < jItems.length; i++) {
        var jItem = jItems[i];
        productIds.push(jItem.id);//商品ID
    }
    //这里要获取券对应的商品
    var products = ProductService.getProductsByIdsWithoutPrice(productIds);

    var datas = [];
    for (var i = 0; i < products.length; i++) {
        var data = {};
        var jProduct = products[i];
        var productId = jProduct.objId;

        var isCanBeBuy = ProductService.isCanBeBuy(jProduct);
        if (!isCanBeBuy) {
            continue;
        }
        //获取商品的sku集合
        var skus = SkuService.getProductSkuList(productId);
        if (!skus || skus.length == 0) {
            continue;
        }

        var sku = skus.get(0);
        if (!sku) {
            continue;
        }
        var skuId = sku.optString("id") + "";

        //获取可卖数
        var inventory = InventoryService.getSkuInventory(productId, skuId);
        data.sellableCount = inventory.sellableCount;
        if (inventory.sellableCount <= 0) {
            continue;
        }
        var merchantId = jProduct.merchantId;
        var merchant = MerchantService.getMerchant(merchantId);
        if (merchant) {
            data.merchantName = merchant.name_cn;
        }
        data.productId = productId;
        data.skuId = skuId;
        datas.push(data);
    }
    //如果商品都不可卖
    if (datas.length == 0) {
        ret.state = "no";
        ret.msg = "商品不可卖";
        out.print(JSON.stringify(ret));
        return;
    }

    ret.products = datas;
    out.print(JSON.stringify(ret));
})();