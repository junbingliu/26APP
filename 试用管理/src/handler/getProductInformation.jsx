//#import Util.js
//#import $tryOutManage:services/tryOutManageServices.jsx
(function () {
    var productId = $.params["productId"] || "";
    var productObjId = $.params["productObjId"] || "";
    var p = tryOutManageServices.getProductObj(productId,productObjId);//此方法是app存储的商品数据跟公共的商品数据信息做融合
    if(p){
        out.print(JSON.stringify(p));
    }
})();