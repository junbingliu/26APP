//#import Util.js
//#import merchant.js
//#import $combiproduct:services/CombiProductService.jsx

var productIds = $.params.ids;
var productIdsArr = productIds.split(",");
var ret={};
var length=0;
var m = $.params.m;
productIdsArr.forEach(function(id){
    var p = CombiProductService.getCombiProduct(id);
    if(p.merchantId==m||m=="head_merchant"){
        CombiProductService.deleteCombiProduct(id);
        length+=1;
        ret = {
            state : "ok",
            length:length
        }
    }else{
        ret = {
            msg:"试图删除其他商家的数据，没有权限！"
        };
    }
});

out.print(JSON.stringify(ret));
