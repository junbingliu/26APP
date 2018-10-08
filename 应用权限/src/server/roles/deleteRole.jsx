//#import Util.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}
var roleId = $.params['roleId'];
SaasRoleService.deleteRole(roleId);
var ret = {state:"ok"};
out.print(JSON.stringify(ret));