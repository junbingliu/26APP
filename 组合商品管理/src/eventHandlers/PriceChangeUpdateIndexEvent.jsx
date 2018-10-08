//#import Util.js
//#import jobs.js
//#import search.js
//#import product.js
//#import $combiproduct:services/CombiProductService.jsx

(function () {

    var merchantId = "" + ctx.get("merchantId");
    var productId = "" + ctx.get("productId");
    var priceId = "" + ctx.get("priceId");

    var searchArgs = {
        fq: "type:combiProduct AND deleted:F AND fixedPrice:F",
        q: "productIds_multiValued:" + productId,
        fl: "id",
        start: "0",
        wt: "json",
        rows: "20"
    };

    try {
        var resString = SearchService.searchSolr("isoneEmall", searchArgs);
        var res = JSON.parse(resString);

        updataCombiProduct(res, 0, productId)


    } catch (e) {
        $.log("组合商品价格变化修改状态：" + e)
    }

})();

function updataCombiProduct(res, start, productId) {
    var total = res.response.numFound;
    var newStart = start + 20;
    var limit = 20;
    if (total < newStart) {
        var ids = res.response.docs.map(function (doc) {
            return doc.id
        });
        var combiProducts = CombiProductService.getCombiProducts(ids);

        for (var x = 0; x < combiProducts.length; x++) {
            var combiProduct = combiProducts[x];
            combiProduct.certified = "F";
            var price = 0;
            combiProduct["parts"].forEach(function (part) {
                part["options"].forEach(function (option) {
                    if (option["priceType"] === "percent") {
                        var unitPrice = ProductService.getMemberPriceBySku(productId, option["skuIds"][0]) || "0";
                        unitPrice = toFixed(Number(unitPrice) * option["percentage"] / 100, 2);
                        price += unitPrice * option["num"];
                    } else {
                        price += option["price"] * option["num"];
                    }
                });
            });
            combiProduct["price"] = toFixed(price, 2);
            CombiProductService.updateCombiProduct(combiProduct);

        }
    } else {
        var searchArgs = {
            fq: "type:combiProduct AND deleted:F AND fixedPrice:F",
            q: "productIds_multiValued:" + productId,
            fl: "id",
            start: newStart + "",
            wt: "json",
            rows: limit + ""
        };
        var resString = SearchService.searchSolr("isoneEmall", searchArgs);
        var res = JSON.parse(resString);
        updataCombiProduct(res, newStart, productId);
    }

}

function toFixed(num, dec) {
    return +(Math.round(+(num.toString() + 'e' + dec)).toString() + 'e' + -dec);
}