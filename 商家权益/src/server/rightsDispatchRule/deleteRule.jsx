//#import Util.js
//#import merchantRights.js

var m = $.params.m;
var id = $.params.id;
MerchantRightsService.removeDispatchRule(id);
var result = {state:"ok"};
out.print(JSON.stringify(result));
