//#import Util.js
//#import SaasUserGroup.js
//#import SaasRoleAssign.js
//#import SaasRoleService.js

(function(){

    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var g = $.params['g'];
    var children = SaasUserGroupService.getChildren(m,g);
    var publicGroup =  {
        id:'usergroup_public',
        name:'公众组',
        description:'所有的用户，以及没有登录的用户都属于公众组。',
        merchantId:'m'

    }
    children.push(publicGroup);
    children = children.map(function(g){
        var roleIds = SaasRoleAssignService.getRolesOfUserGroup(m, g.id);
        var effectiveRoles = [];;
        roleIds.forEach(function(roleId){
            var r = SaasRoleService.getRole(roleId);
            if(!r){
                //从组中删除role
                SaasRoleAssignService.removeUserGroupFromRole(m,g.id,roleId);
                return ;
            }
            var role = {id: r.id,name: r.name};
            effectiveRoles.push(role);
        });
        g.roles = effectiveRoles;
        return g;
    });
    var result = {
        state:"ok",
        groups:children
    }
    out.print(JSON.stringify(result));
})();