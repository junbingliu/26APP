//#import Util.js
//#import inventory.js

;(function(){
    try{
        var skuId = $.params.skuId;
        var productId = $.params.productId;
        var inventory = InventoryService.getSkuInventory(productId,skuId);
        var sellableCount = inventory.sellableCount;
        var ret = {
            state:"ok",
            sellableCount:sellableCount,
            skuId:skuId
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