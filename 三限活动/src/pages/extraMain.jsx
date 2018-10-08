//#import Util.js
//#import $limitBuy:services/limitBuyService.jsx
//#import artTemplate.js


;(function(){
    var m = $.params.m;
    var productId = $.params.productId;
    var config = LimitBuyService.getConfig(productId);
    var pageData = {m:m,productId:productId,config:config};
    var source = $.getProgram(appMd5,"client/html/main.html");
    var fn = template.compile(source);
    out.print(fn(pageData));
})();