//#import doT.min.js
//#import Util.js
//#import product.js
(function () {

    try {

        //填充弹框内数据
        var m = $.params.merchantId;
        var id=$.params.id;
        var productObj = ProductService.getProduct(id);
        var memberPrice = ProductService.getMemberPrice(productObj);
        var marketPrice = ProductService.getMarketPrice(productObj);
        var sku = ProductService.getSkus(id);
        var realAmount = ProductService.getRealAmount(id,sku[0].id);
        if (!memberPrice) {
            memberPrice = "";
        }
        if (!marketPrice) {
            marketPrice = "";
        }
        if (!realAmount) {
            realAmount = "";
        }

        var pageData = {
            memberPrice:memberPrice,
            marketPrice:marketPrice,
            realAmount:realAmount,
            merchantId: m,
            id:id
        };

        var template = $.getProgram(appMd5, "pages/editProduct.jsxp");
        var pageFn = doT.template(template);
        out.print(pageFn(pageData));
    } catch (e) {
        out.print("发生了错误: "+e);
    }
})();

