//#import Util.js
//#import SaasUserGroup.js
//#import SaasRoleAssign.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var g = $.params.g;
var roleIds = $.params.roleIds;

var ids = roleIds.split(",");
ids.map(function(memberGroupId){
    SaasRoleAssignService.assignUserGroupToRole(merchant,g,memberGroupId);
});
var ret = {state:"ok"};
out.print(JSON.stringify(ret));