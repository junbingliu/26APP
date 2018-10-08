//#import Util.js
//#import SaasRoleService.js
//#import SaasRoleAssign.js
//#import SaasUserGroup.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var privateRoles = SaasRoleService.getPrivateRoles(merchant,0,-1);
privateRoles =privateRoles.map(function(role){
    var userGroupIds = SaasRoleAssignService.getUserGroupsOfRole(merchant, role.id);
    var userGroups = userGroupIds.map(function(roleId){
        var u = SaasUserGroupService.getSaasUserGroup(roleId);
        var userGroup = {id: u.id,name: u.name};
        return userGroup;
    });
    role.userGroups = userGroups;
    return role;
});
var ret ={
    state:'ok',
    roles:privateRoles
}
out.print(JSON.stringify(ret));