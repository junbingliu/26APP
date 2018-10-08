//#import Util.js
//#import doT.min.js
//#import saasRegion.js
var m = $.params['m'];
if(!m){
    m= $.getDefaultMerchantId();
}
var regionUrl = SaasRegionService.getCurrentRegionUrl();
if(!regionUrl){
    regionUrl = "";
}
var template = $.getProgram(appMd5,"pages/setting.jsxp");
var pageData = {merchantId:m,regionUrl:regionUrl};
var pageFn = doT.template(template);
out.print(pageFn(pageData));
