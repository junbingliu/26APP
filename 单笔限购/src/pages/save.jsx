//#import Util.js
//#import $limitBuy:services/limitBuyService.jsx

(function(){
    var m = $.params.m;
    var productId = $.params.productId;
    var minNumber = $.params.minNumber;
    var maxNumber = $.params.maxNumber;
    var userGroupId = $.params.userGroupId;
    LimitBuyService.saveConfig(productId,{minNumber:minNumber,maxNumber:maxNumber,userGroupId:userGroupId});
    response.sendRedirect("extraMain.jsx?m=" + m + "&productId=" + productId + "&userGroupId=" + userGroupId);
})();