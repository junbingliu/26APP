//#import Util.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if (!merchant) {
    merchant = 'm_100';
}
var roleId = $.params['roleId'];
var groupIds =   SaasRoleService.getActionGroupsOfRole(roleId);
var ret = {state:"ok",groupIds:groupIds};
out.print(JSON.stringify(ret));