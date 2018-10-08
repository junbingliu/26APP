//#import Util.js
//#import doT.min.js
//#import $merchantOperator:services/merchantOperatorService.jsx
//#import login.js
//#import merchant.js

(function(){
  var template = $.getProgram(appMd5,"pages/myShops.html");
  var userId = LoginService.getBackEndLoginUserId();
  var merIds = MerchantOperatorService.getMerIdsOfUser(userId);
  var merchants = MerchantService.getMerchantsByIds(merIds);
  var m = $.params.m;
  var scanCode = $.getUUID();
  var pageData = {m:m,merchants:merchants};
  var pageFn = doT.template(template);
  out.print(pageFn(pageData));
})();