//#import Util.js
//#import user.js
//#import SaasUserGroup.js

(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var g = $.params['g'];
    var key = $.params['u'];
    var user = UserService.getUserByKey(key);
    if(user!=null) {
        var userIds = SaasUserGroupService.getUserIdsOfUserGroup(m, g,0,-1);
        if(userIds.indexOf(user.id)>=0){
            var ret = {
                state:"err",
                msg:"用户已经在组里。"
            }
            out.print(JSON.stringify(ret));
            return;
        }
        SaasUserGroupService.addUser2UserGroup(user.id,m, g);
        var ret = {
            state:"ok",
            u:user
        }
        out.print(JSON.stringify(ret));
    }
    else{
        var ret = {
            state:"err",
            msg:"用户不存在。"
        }
        out.print(JSON.stringify(ret));
    }


})();