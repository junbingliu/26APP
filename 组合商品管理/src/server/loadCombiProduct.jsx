//#import Util.js
//#import product.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx
var id = $.params.id;
var combiProduct = CombiProductService.getCombiProduct(id);
var spec = $.params.spec;


//if(combiProduct.productItems){
//    var productIds = [];
//    combiProduct.productItems.forEach(function(productItem){
//        productIds.push(productItem.productId);
//    });
//    var products = ProductService.getProducts(productIds,spec);
//    if(products){
//        ProductService.setMerchantNames(products);
//        for(var i=0; i<combiProduct.productItems.length; i++){
//            var productItem = combiProduct.productItems[i];
//            var product = products[i];
//            productItem.imgUrl = product.logo;
//            productItem.productName = product.name;
//            productItem.merchantName = product.merchantName;
//            productItem.merchantId = product.merchantId;
//            if(productItem.skuIds && productItem.skuIds.length>0){
//
//                var priceList= ProductService.getMemberPriceBySkuId(product,productItem.skuIds[0]);
//                if(priceList&&priceList.unitPrice){
//                    productItem.memberPrice =(priceList.unitPrice/100).toFixed(2);
//                    $.log("memberPrice===8="+ productItem.memberPrice)
//                }else{
//                    productItem.memberPrice = ProductService.getMemberPrice(product);
//                }
//
//            }
//            else{
//                productItem.memberPrice = ProductService.getMemberPrice(product);
//            }
//            if(!productItem.marketPrice||productItem.marketPrice!="暂无价格"){
//               productItem.marketPrice=ProductService.getMarketPrice(product);
//            }
//            var skus = ProductService.getSkusAndAttrs(productItem.productId);
//            if(skus){
//                skus.forEach(function(sku){
//                    if(productItem.skuIds.indexOf(sku.id)>-1){
//                        sku.selected = true;
//                    }
//                    else{
//                        sku.selected = false;
//                    }
//                });
//                productItem.skus = skus;
//            }
//        }
//    }
//
//    if(combiProduct.fileIds){
//        var images = combiProduct.fileIds.map(function(fileId){
//            var imgUrl = FileService.getRelatedUrl(fileId,spec);
//            return {
//                fileId:fileId,
//                imgUrl:imgUrl
//            }
//        });
//        combiProduct.images = images;
//    }
//    else{
//        combiProduct.images = [];
//    }
//}

if (combiProduct.parts) {
    var productIds = [];
    combiProduct.parts.forEach(function (part) {
        productIds = productIds.concat(part.options.map(function (option) {
            return option["productId"];
        }));
    });

    var products = ProductService.getProducts(productIds, spec);
    if (products) {

        ProductService.setMerchantNames(products);
        products.forEach(function (product) {
            for (var i = 0; i < combiProduct.parts.length; i++) {
                var part = combiProduct.parts[i];
                for (var j = 0; j < part.options.length; j++) {

                    var option = part.options[j];
                    if (option["productId"] === product["objId"]) {
                        option.imgUrl = product.logo;
                        option.productName = product.name;
                        option.merchantName = product.merchantName;
                        option.merchantId = product.merchantId;
                        if (option.skuIds && option.skuIds.length > 0) {

                            var priceList = ProductService.getMemberPriceBySkuId(product, option.skuIds[0]);
                            if (priceList && priceList.unitPrice) {
                                option.memberPrice = (priceList.unitPrice / 100).toFixed(2);
                                $.log("memberPrice===8=" + option.memberPrice)
                            } else {
                                option.memberPrice = ProductService.getMemberPrice(product);
                            }
                        }
                        else {
                            option.memberPrice = ProductService.getMemberPrice(product);
                        }
                        if (!option.marketPrice || option.marketPrice != "暂无价格") {
                            option.marketPrice = ProductService.getMarketPrice(product);
                        }
                        var skus = ProductService.getSkusAndAttrs(option.productId);
                        if (skus) {
                            skus = skus.map(function (sku) {
                                if (option.skuIds.indexOf(sku.id) > -1) {
                                    sku.selected = true;
                                }
                                else {
                                    sku.selected = false;
                                }
                                var cxt = "{skuId:" + sku.id + ",factories:[{factory:MF},{factory:RPF}]}";
                                var priceValueList = ProductService.getPriceValueList(option.productId, "", "head_merchant", 1, cxt, "normalPricePolicy");
                                if (priceValueList[0]) {
                                    sku["marketPrice"] = toFixed(priceValueList[0]["unitPrice"] / 100, 2);
                                } else {
                                    sku["marketPrice"] = 0;
                                }
                                if (priceValueList[1]) {
                                    sku["memberPrice"] = toFixed(priceValueList[1]["unitPrice"] / 100, 2);
                                } else {
                                    sku["memberPrice"] = 0;
                                }

                                return sku;
                            });
                            option.skus = skus;
                        }
                    }
                }
            }
        });
    }
    if (combiProduct.fileIds) {
        var images = combiProduct.fileIds.map(function (fileId) {
            var imgUrl = FileService.getRelatedUrl(fileId, spec);
            return {
                fileId: fileId,
                imgUrl: imgUrl
            }
        });
        combiProduct.images = images;
    }
    else {
        combiProduct.images = [];
    }
    if (combiProduct.fixedPrice === "Y") {
        combiProduct.fixedPrice = true;
    } else {
        combiProduct.fixedPrice = false;
    }
}

var ret = {
    state: "ok",
    combiProduct: combiProduct
};
out.print(JSON.stringify(ret));

function toFixed(num, dec) {
    return +(Math.round(+(num.toString() + 'e' + dec)).toString() + 'e' + -dec);
}

