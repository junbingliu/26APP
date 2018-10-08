//#import Util.js
//#import $limitBuy:services/limitBuyService.jsx

(function(){
    var m = $.params.m;
    var productId = $.params.productId;
    var minNumber = $.params.minNumber;
    var maxNumber = $.params.maxNumber;
    LimitBuyService.saveConfig(productId,{minNumber:minNumber,maxNumber:maxNumber});
    response.sendRedirect("extraMain.jsx?m=" + m + "&productId=" + productId);
})();