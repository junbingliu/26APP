//#import Util.js
//#import PreSale.js
//#import product.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CommonUtil.jsx
//#import $preSaleRule:libs/preSaleRule.jsx


/**
 * 显示预售截止时间及实时下单量，提供尾款支付接口
 * serviceCode: "preSaleDetail" 获取预售详情  productId 预售商品ID
 */
(function () {
    var res = CommonUtil.initRes();
    var jRule = {};

    try {
        for (var key in $.params) {
            if (typeof $.params[key] === "string")
                $.params[key] = $.params[key].trim()
        }
        var productId = $.params.productId;
        var serviceCode = $.params.serviceCode;

        if (!serviceCode) {
            CommonUtil.setErrCode(res, ErrorCode.preSale.E1M00001);
            return;
        }

        if (!productId) {
            CommonUtil.setErrCode(res, ErrorCode.preSale.E1M00002);
            return;
        }

        jRule = PreSaleService.getProductPreSaleRule(productId);
        if (!jRule) {
            CommonUtil.setErrCode(res, ErrorCode.preSale.E1M00003);
            return;
        }

        //获取商品标签等普通商品属性
        var jProduct = ProductApi.ProductFunction.getProduct(productId);
        if (!jProduct) {
            CommonUtil.setErrCode(res, ErrorCode.product.E1M00005);
            return;
        }
        var product = JSON.parse(jProduct.toString());

        var productAttr = {
            name: product.name || "",
            mobileContent: product.mobileContent || "",
            sellingPoint: product.sellingPoint || "",
            tag: product.tag || ""
        };

        //获取预售详情
        if ("preSaleDetail" === serviceCode) {
            var data = {
                bookAmount: PreSaleService.getBookAmount(productId),  //获取预定的人数
                jRule: jRule,
                productAttr: productAttr
            }
            CommonUtil.setRetData(res, data);
            return;
        }
    } catch (e) {
        $.log(e);
        CommonUtil.setErrCode(res, ErrorCode.preSale.E1Z00001, e);
    }

})();