//#import Util.js
//#import file.js
//#import $combiproduct:services/CombiProductService.jsx

;(function(){
    var ret={};
    try{
        var id = $.params.id;
        var combiProducts = CombiProductService.getCombiProducts([id]);
        if(combiProducts[0].fileIds[1]){
            var bigRelatedUrl=FileService.getRelatedUrl(combiProducts[0].fileIds[1],"90X90");
             ret={
                state:"ok",
                icon:bigRelatedUrl
            }

        }else{
             ret={
                state:"error",
                msg:"该组合商品没有添加图片！"
            }
        }
    }catch(e){
         ret={
            state:"error",
            msg:e
        }
    }
    out.print(JSON.stringify(ret));

})();