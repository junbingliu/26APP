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
    children = children.map(function(userGroup){
        return {id:userGroup.id,name:userGroup.name,selected:false}
    });
    var result = {
        state:"ok",
        groups:children
    }
    out.print(JSON.stringify(result));
})();