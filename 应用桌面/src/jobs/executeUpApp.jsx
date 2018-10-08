//#import $productBatchUp:services/productBatchUp.jsx
//#import product.js
var appForm = ProductBatchUpService.getById(appFormId);
if(appForm.certifyState == 'certified'){
    var productIds = appForm.productIds;
    if(productIds){
       if (appForm.action=='down'){
            productIds.forEach(function(id){
                ProductService.publishDown(id,"");
            });
        }
        else{
            productIds.forEach(function(id){
                ProductService.publishUp(id,"");
            });
        }
    }
    ProductBatchUpService.setRunExecuted(appFormId);
}
