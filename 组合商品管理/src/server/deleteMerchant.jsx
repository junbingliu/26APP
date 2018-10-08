//#import Util.js
//#import merchant.js
//#import $combiproduct:services/CombiProductService.jsx
//#import $combiproduct:services/ComMerchantService.jsx

var productIds = $.params.ids;
var productIdsArr = productIds.split(",");
var ret={};
var m = $.params.m;

    productIdsArr.forEach(function(id){
        var p = CombiProductService.getCombiProduct(id);
        var published = p.published;
        if(m =="head_merchant"||m==p.merchantId){
            var merchants = MerchantService.getMerchant(p.merchantId);
            //如果之前审核过，那么会放到索引里面去，此时，修改comMerchantService
            if(published =="T"&&merchants && merchants.mainColumnId&&merchants.mainColumnId =="c_stylist_merchant"){
                var ComId="combiProduct_merchant"+p.merchantId;
                var comMerchant =ComMerchantService.get(ComId);
                comMerchant.id=ComId;
                comMerchant.goodsNumber=parseInt(comMerchant.goodsNumber)-1;
                ComMerchantService.update(comMerchant);
            }
                ret = {
                    state : "ok"
                }
        }
   });

out.print(JSON.stringify(ret));
