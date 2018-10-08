//#import Util.js
//#import SaasRoleService.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var privateRoles = SaasRoleService.getPrivateRoles(merchant,0,-1);
privateRoles =privateRoles.map(function(role){
    return {id:role.id,name:role.name,selected:false}
});
var ret ={
    state:'ok',
    roles:privateRoles
}
out.print(JSON.stringify(ret));