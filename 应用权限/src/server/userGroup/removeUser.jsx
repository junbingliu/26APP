//#import Util.js
//#import user.js
//#import SaasUserGroup.js

(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var g = $.params['g'];
    var uid =  $.params['u'];
    SaasUserGroupService.removeUserFromUserGroup(uid,m,g);
    var ret = {
        state:"ok"
    }
    out.print(JSON.stringify(ret));
})();