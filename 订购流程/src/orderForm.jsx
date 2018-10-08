//#import Util.js
//#import session.js
//#import doT.min.js
var m = $.params.m;
var buyerId = $.params.buyerId;
if(!buyerId){
    buyerId = SessionService.getSessionValue("backBuyerId",request);
}
var cartId = $.params.cartId;
(function(){
    var template = $.getProgram(appMd5,"client/orderFormApp.html");
    var pageData = {merchantId:m,buyerId:buyerId,cartId:cartId,m:m};
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

