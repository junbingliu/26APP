//#import Util.js
//#import SaasUserGroup.js
//#import SaasRoleAssign.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var R = $.params.R;
var userGroupIds = $.params.userGroupIds;

var ids = userGroupIds.split(",");
ids.map(function(userGroupId){
    SaasRoleAssignService.assignUserGroupToRole(merchant,userGroupId,R);
});
var ret = {state:"ok"};
out.print(JSON.stringify(ret));