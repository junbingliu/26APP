//#import Util.js
//#import product.js
//#import file.js
//#import login.js

;(function(){
        var id=$.params.id;//商品ID
        var merchantId=$.params.merchantId;//商家ID
        var user = LoginService.getFrontendUser();
        var ret={};
        if(!id){
            ret.code = "E1B000006";
            ret.msg = "商品id不能空";
            out.print(JSON.stringify(ret));
            return;
        }
       //获取商品优惠规则
        if(user==null){
            user={};
        }
        var rules=ProductService.getClassifiedPossibleRules(id,merchantId,user.id||"-1");
        //获取换购和赠品图片
        if(rules){

            if(rules.exchange){
                for(var i=0;i<rules.exchange.length;i++){
                    var lowPriceBuyProducts=rules.exchange[i].lowPriceBuyProducts;
                    if(lowPriceBuyProducts){
                        for(var j=0;j<lowPriceBuyProducts.length;j++){
                            var exchangeProduct=ProductService.getProduct(lowPriceBuyProducts[j].id);
                            var exchangeProductPic=ProductService.getPics(exchangeProduct);
                            if(exchangeProductPic.length>0){
                                var relatedUrl=FileService.getRelatedUrl(exchangeProductPic[0].fileId,"40X40");
                            }else{
                                var relatedUrl="/upload/nopic_200.jpg";
                            }
                            rules.exchange[i].lowPriceBuyProducts[j].pic=relatedUrl;
                        }
                    }
                }
            }
            if(rules.gift){
                for(var i=0;i<rules.gift.length;i++){
                    var presentProducts=rules.gift[i].presentProducts;
                    if(presentProducts){
                        for(var j=0;j<presentProducts.length;j++){
                            var presentProduct=ProductService.getProduct(presentProducts[j].id);
                            var presentProductPic=ProductService.getPics(presentProduct);
                            if(presentProductPic.length>0){
                                var relatedUrl=FileService.getRelatedUrl(presentProductPic[0].fileId,"40X40");
                            }else{
                                var relatedUrl="/upload/nopic_200.jpg";
                            }
                            rules.gift[i].presentProducts[j].pic=relatedUrl;
                        }
                    }
                }
            }
        }
        ret.code = "S0A000000";
        ret.data = rules;
        out.print(JSON.stringify(ret));
})();