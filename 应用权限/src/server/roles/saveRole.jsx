//#import Util.js
//#import SaasRoleService.js


var merchant = $.params['m'];
if (!merchant) {
    merchant = 'm_100';
}
var roleId = $.params['roleId'];
var name = $.params['name'];
var description = $.params['description'];
var actionGroupIdsString = $.params['actionGroupIds'];
var actionGroupIds;
if(!actionGroupIdsString){
    actionGroupIds = [];
}
else{
    actionGroupIds = JSON.parse(actionGroupIdsString);
}
var role = {}
if(roleId){
    role.id = roleId;
}
role.name = name;
role.description = description;
role.creatorMerchantId = merchant;
if(!roleId){
    roleId = SaasRoleService.addRole(role);
}
else{
    role.id = roleId;
    SaasRoleService.updateRole(role);
    SaasRoleService.clearActionGroups(roleId);
}
actionGroupIds.map(function(actionGroupId){
    SaasRoleService.addActionGroupToRole(roleId,actionGroupId);
});
var ret = {state:"ok"}
out.print(JSON.stringify(ret));
