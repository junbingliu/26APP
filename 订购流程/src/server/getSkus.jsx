//#import Util.js
//#import cart.js
//#import product.js

(function(){
    var productId = $.params.id;
    var product = ProductService.getProduct(productId);
    var skus = ProductService.getSkus(productId);
    var inventoryAttrs = ProductService.getInventoryAttrs(product);
    var validSkus =[];
    if(skus.length>1){
        skus.forEach(function(sku){
            if(!sku.isHead){
                validSkus.push(sku);
            }
        });
    }
    else if(skus.length==1){
        validSkus.push(skus[0]);
    }
    var ret = {
        state:'ok',
        skus:validSkus,
        inventoryAttrs:inventoryAttrs
    }
    out.print(JSON.stringify(ret));
})();