//#import Util.js
//#import cart.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import normalBuy.js
//#import payment.js
//#import @handler/cart/OcConverter.jsx
//#import column.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx
(function(){
    var t1 = new Date().getTime();
    var userId = LoginService.getFrontendUserId();
    var t2 = new Date().getTime();

    var userMobile = "";
    if (userId && userId != "") {
        var jUser = UserService.getUser(userId);
        if (jUser) {
            userMobile = jUser.mobilPhone || "";
        }
    }

    var mode = $.params.mode;

    if(!mode || mode != "form"){
        clearAllCombiProduct();
    }

    var bigCart = CartService.getNativeBigCart(false);
    if(!bigCart){
        var ret = {
            state:"empty",
            msg:"购物车是空的。"
        }
        out.print(JSON.stringify(ret));
        return;
    }
    var t3 = new Date().getTime();

    var userAgent = DssService.getUserAgent(request);
    if(userAgent.deviceCategory=="Personal computer"){
        bigCart.put("buyingDevice","pc");
    }
    else{
        bigCart.put("buyingDevice","mobile");
    }
    var t4 = new Date().getTime();

//在购物车中需要将checked和非checked的都拿出来
    var ocs = CartService.getOcsFromBigCart(userId,bigCart,"common",false);
    if(!ocs){
        var ret = {
            state:"empty",
            msg:"购物车是空的。"
        }
        out.print(JSON.stringify(ret));
        return;
    }
    var t5 = new Date().getTime();
    var carts = [];
    for(var i=0; i<ocs.size(); i++){
        var oc = ocs.get(i);
        var cart = convertOcToCart(oc);
        var inheritPlatform = PaymentSettingService.getInheritPlatform(oc.merchantId);
        if (inheritPlatform) {
            oc.payMerchantId = "head_merchant";
        }
        else {
            oc.payMerchantId = oc.merchantId;
        }
        var paymentList = [];
        var codPayment = PaymentService.getCodPayment(oc.payMerchantId);
        if (codPayment) {
            codPayment.isOnline = false;
            codPayment.isCod = true;
            codPayment.desc = "送货上门后再收款、支持现金、pos机刷卡、支票支付 查看服务及配送范围";
            paymentList.push(codPayment);
        }

        var onlinePayment = PaymentService.getOnlinePayment(oc.payMerchantId);
        if (onlinePayment) {
            onlinePayment.isOnline = true;
            onlinePayment.isCod = false;
            onlinePayment.desc = "即时到帐，支持绝大数银行借记卡及部分银行信用卡";
            paymentList.push(onlinePayment);
        }
        cart.paymentList = paymentList;
        if(cart.buyItems){
            cart.buyItems.forEach(function(item){
                var columnIds = item.columnIds;
                if(columnIds){
                    item.columnIds = columnIds.split(",");
                }
                else{
                    item.columnIds = [item.columnId];
                }
                if(item.productId.indexOf("combiProduct_")!=-1){
                    var combiProduct = CombiProductService.getCombiProduct(item.productId);
                   item.icon= FileService.getRelatedUrl(combiProduct.fileIds[0], "120X90");
                }
                if(item.unitPrice){
                    item.unitPrice=Number(item.unitPrice).toFixed(2);
                }
            });
        }
        carts.push(cart);
    }


    var t6=new Date().getTime();
    var ret = {
        userId:userId,
        userMobile:userMobile,
        state:"ok",
        time:(t6-t1),
        getOcsTime:(t5-t4),
        convertTime:(t6-t5),
        getCartTime:(t3-t2),
        getUserTime:(t2-t1),
        getUserAgentTime:(t4-t3),
        carts:carts
    };
    out.print(JSON.stringify(ret));
})();


function clearAllCombiProduct() {
    var bigCart = CartService.getBigCart();

    var isUpdated = false;
    var carts = bigCart.carts;
    for(var k in carts) {
        var cart = carts[k];
        if (cart && cart.items) {
            var newItems = [];
            var isItemChanged = false;
            for (var key in cart.items) {
                var item = cart.items[key];
                if (item.combiProductId && item.combiProductId != "") {
                    isUpdated = true;
                    isItemChanged = true;
                } else {
                    newItems.push(item);
                }
            }

            if(isItemChanged){
                cart.items = newItems;
            }
        }
    }

    if(isUpdated){
        CartService.updateBigCart(bigCart);
    }
}


