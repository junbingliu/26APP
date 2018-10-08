//#import Util.js
//#import jobs.js
//#import search.js
//#import product.js
//#import $combiproduct:services/CombiProductService.jsx

(function () {


    var searchArgs = {
        fq:"type:combiProduct AND deleted:F",
        q:"*",
        fl:"id",
        start:"0",
        wt:"json",
        rows : "2"
    };

    try {
        var res = SearchService.searchSolr("isoneEmall", searchArgs);

        updataCombiProduct(res,0)


    } catch (e) {
        $.log("组合商品价格变化修改状态："+e)
    }

})();

function updataCombiProduct(res,start){
    res=JSON.parse(res);
    var total = res.response.numFound;
    var newStart=start+20;
    var end=newStart+20;
    var limit=20;
    var ids = res.response.docs.map(function(doc){return doc.id});
    out.print("ids=="+JSON.stringify(ids));
    var combiProducts = CombiProductService.getCombiProducts(ids);

    var isUpdate=true;
    for(var x=0;x< combiProducts.length;x++){
        var combiProduct=combiProducts[x];
        //for (var y = 0; y < combiProduct.parts.length; y++) {
        //    var value = combiProduct.parts[y];
        //    if (value) {
        //        var options = value.options;
        //        for (var z = 0; z < options.length; z++) {
        //
        //            if(!options[z].merchantId){
        //                //根据子商品id获取子商品信息
        //                var s = ProductService.getProduct(options[z].productId);
        //                if(s){
        //
        //                    options[z].merchantId = s.merchantId;
        //                }
        //            }else{
        //                isUpdate =false;
        //            }
        //
        //
        //        }
        //    }
        //}

        //if(isUpdate){
            CombiProductService.updateCombiProduct(combiProduct);
        //}

    }
    if(total< newStart){

        out.print("total=="+total);
    }else{
        var searchArgs = {
            fq:"type:combiProduct AND deleted:F",
            q:"*",
            fl:"id",
            start:newStart+"",
            wt:"json",
            rows : limit+""
        };
        var res =SearchService.searchSolr("isoneEmall", searchArgs);
        updataCombiProduct(res,end);
    }

}