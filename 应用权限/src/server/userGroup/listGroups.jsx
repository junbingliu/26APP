//#import Util.js
//#import SaasUserGroup.js
//#import user.js

(function(){

        var m = $.params['m'];
        if(!m){
            m="m_100";
        }
        var g = $.params['g'];
        var children = SaasUserGroupService.getChildren(m,g);
        children = children.map(function(g){
            var userIds = SaasUserGroupService.getUserIdsOfUserGroup(m, g.id,0,-1);
            var users = userIds.map(function(uid){
                var u = UserService.getUser(uid);
                if(u){
                    return {id: u.id,loginId: u.loginId, realName: u.realName,nickName: u.nickName};
                }
                return {};
            });
            g.users = users;
            return g;
        });
        var result = {
            state:"ok",
            groups:children
        }
        out.print(JSON.stringify(result));

})();