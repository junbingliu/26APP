//#import Util.js
//#import SaasRoleService.js
//#import SaasRoleAssign.js
//#import SaasUserGroup.js

(function(){

    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var allRoles = SaasRoleService.getPrivateRoles(m,0,-1);
    var allRoleIds = allRoles.map(function(role){return role.id});
    var g = $.params['g'];
    var children = SaasUserGroupService.getChildren(m,g);
    var deletedRoleIds = [];
    children = children.map(function(g){
        var roleIds = SaasRoleAssignService.getRolesOfUserGroup(m, g.id);
        var effectiveRoles = [];;
        roleIds.forEach(function(roleId){
            var idx = allRoleIds.indexOf(roleId);
            if(idx<=-1){
                //从组中删除role
                SaasRoleAssignService.removeUserGroupFromRole(m,g.id,roleId);
                deletedRoleIds.push(roleId);
            }
        });
    });
    out.print("删除了下列roleId:" + JSON.stringify(deletedRoleIds));
})();
