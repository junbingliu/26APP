//#import Util.js
//#import product.js

;(function(){
    try{
        var skuId = $.params.skuId;
        var productId = $.params.productId;
        var userId = $.params.userId;
        var merchantId = $.params.merchantId;
        var price = ProductService.getRealPayPrice(userId, merchantId, productId, skuId);
        var ret = {
            state:"ok",
            price:price
        }
        out.print(JSON.stringify(ret));
    }
    catch(e){
        var ret = {
            state:"err",
            msg:e
        }
        out.print(JSON.stringify(ret));
    }
})();