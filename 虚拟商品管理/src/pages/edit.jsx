//#import Util.js
//#import login.js
//#import product.js
//#import open-product.js
(function () {
    var result = {};

    //修改商品 市场价, 现价, 实际库存
    try {
        var loginUserId = LoginService.getBackEndLoginUserId();

        if (!loginUserId){
            result.code = "100";
            result.msg = "您还未登录, 请登录后操作";
            out.print(JSON.stringify(result));
            return;
        }

        var merchantId = $.params.merchantId;
        var productId = $.params.id;
        var memberPrice = $.params.memberPrice;
        var marketPrice = $.params.marketPrice;
        var realAmount = $.params.realAmount;

        var skuId = ProductService.getSkus(productId);
        ProductService.setRealAmount(productId,skuId[0].id,realAmount);

        var jConfig = {};
        jConfig.isAddIfSamePrice = false;
        var jSkuInfo = {};
        jSkuInfo.marketPrice = marketPrice;
        jSkuInfo.memberPrice = memberPrice;
        jSkuInfo.realSkuId = skuId[0].skuId;

        //修改市场价
        var jResult = OpenProductService.updateSku(merchantId,jSkuInfo,loginUserId,jConfig);

        out.print(JSON.stringify(jResult));
    }catch(e){
        result.status = "99";
        result.msg = "出现异常了, 异常信息为: "+e;
        out.print(JSON.stringify(result));
    }

})();