//#import Util.js
//#import product.js
(function(){

    var merchantId = $.params["m"];
    var columnId = $.params["id"];
    var searchArgs = {
       fetchCount:0,
       fromPath:0

    };
    if(!merchantId){
        merchantId = "m_100";
    }
    if(merchantId && merchantId!=="head_merchant"){
        var children = ProductService.getChildrenWithBusinessRange(merchantId,columnId);
        searchArgs.merchantId = merchantId;
    }
    else{
        var children = ProductService.getChildren(columnId);
    }

    for(var i=0; i<children.length; i++){
        var col = children[i];
        var hasChildren = ProductService.hasChildren(col.id);
        searchArgs.path = col.id;
        var count = ProductService.getCount(searchArgs);
        col.count = count;
        col.hasChildren = hasChildren;
    }
    var result = {total:children.length,records:children,state:'ok'};
    out.print(JSON.stringify(result));
})();
