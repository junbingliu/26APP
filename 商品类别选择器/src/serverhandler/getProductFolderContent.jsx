//#import Util.js
//#import column.js
//#import product.js
//#import file.js

var dir = $.params.dir;
var column = ColumnService.getColumn(dir);
var items = [];
var merchantId = $.params.m;

if(typeof merchantId == "undefined"){
    merchantId = "head_merchant";
}

//获得子栏目
var children = ColumnService.getChildren(dir);
for (var i = 0; i < children.length; i++) {
    var item = {
        id: children[i].id,
        itemType: "col",
        name:children[i].name
    };
    items.push(item);
}
//获得栏目下的商品

for (var i = 0; i < products.length; i++) {
    var productId = products[i].objId;
    var name = products[i].title1.value;
    productId = productId.toLocaleLowerCase();
    var pics = ProductService.getPics(products[i]);
    var memberPrice=ProductService.getMemberPriceByProductId(productId);
    if(memberPrice){
        memberPrice = "￥" + parseFloat(memberPrice).toFixed(2);
    }
    else{
        memberPrice = "暂无价格";
    }
    if(pics.length>0){
        var fileId = pics[0];
        var logo =  FileService.getRelatedUrl(fileId["fileId"], "100X100");
    }
    else{
        var logo = "";
    }
    products[i].logo = logo;

    var item = {
        id: productId,
        imgUrl: logo,
        itemType: "product",
        name: name,
        memberPrice:memberPrice
    }
    items.push(item);
}

var result = {
    columnName : column.name,
    currentDir: dir,
    parentDir:column.parentId,
    items : items
};
out.print(JSON.stringify(result));