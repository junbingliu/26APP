//#import Util.js
//#import $combiproduct:services/CombiProductService.jsx

var productIds = $.params.ids;
var productIdsArr = productIds.split(",");
var m = $.params.m;
var ret ={};
productIdsArr.forEach(function(id){
    //CombiProductService.deleteCombiProduct(id);
    var p = CombiProductService.getCombiProduct(id);


});
out.print(JSON.stringify(ret));
