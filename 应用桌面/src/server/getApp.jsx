//#import Util.js
//#import login.js
//#import $productBatchUp:services/productBatchUp.jsx
//#import user.js
//#import product.js

var appId = $.params.appId;
var app = ProductBatchUpService.getById(appId);
//将商品名称和图片取出来
var products = ProductService.getProducts(app.productIds,"80X80");
$.log(JSON.stringify(products));
products = products.map(function(product){
    return {
        id:product.objId,
        imgUrl:product.logo || '/upload/nopic_50.gif',
        name:product.name
    }
});
app.products = products;
var ret = {
    state:"ok",
    app:app
}
out.print(JSON.stringify(ret));

