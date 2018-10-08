//#import Util.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var privateRoles = SaasRoleService.getPrivateRoles(merchant,0,-1);
privateRoles =privateRoles.map(function(role){
    role.show=true;
    return role;
});
var importedRoles = SaasRoleService.getImportedRoles(merchant,0,-1);
var ret ={
    state:'ok',
    privateRoles:privateRoles,
    importedRoles:importedRoles
}
out.print(JSON.stringify(ret));