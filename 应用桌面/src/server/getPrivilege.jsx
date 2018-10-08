//#import Util.js
//#import login.js
//#import $productBatchUp:services/productBatchUp.jsx

var m = $.params.m;
var privilege = ProductBatchUpService.getPrivilege(m);
var ret = {
    state:"ok",
    privilege:privilege
}
out.print(JSON.stringify(ret));