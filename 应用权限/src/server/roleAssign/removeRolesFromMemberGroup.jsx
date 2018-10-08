//#import Util.js
//#import SaasUserGroup.js
//#import SaasRoleAssign.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var g = $.params.g;
var roleId = $.params.roleId;
SaasRoleAssignService.removeUserGroupFromRole(merchant,g,roleId);
var ret = {state:"ok"};
out.print(JSON.stringify(ret));