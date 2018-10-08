//#import Util.js
//#import $combiproduct:services/CombiProductService.jsx

var productIds = $.params.ids;
var productIdsArr = productIds.split(",");
var m = $.params.m;
var ret ={};
productIdsArr.forEach(function(id){
    //CombiProductService.deleteCombiProduct(id);
    var p = CombiProductService.getCombiProduct(id);
    p.published = "T";
    p.publishedTime = new Date().getTime();
    if("head_merchant"==m){
        CombiProductService.updateCombiProduct(p);
        ret = {
            state : "ok"
        };
    }else{
        ret = {
            state : "error",
            msg:"没有权限！"
        };
        //throw "试图修改其他商家的数据。m=" + m + ",p.merchantId=" + p.merchantId + ", tht ip:" + $.getClientIp();

    }

});
out.print(JSON.stringify(ret));
