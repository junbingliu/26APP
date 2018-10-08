//#import Util.js
//#import SaasUserGroup.js

(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var g = $.params['g'];

    var oldGroup = SaasUserGroupService.getSaasUserGroup(g);
    if(oldGroup.merchantId!=m){
        var ret = {state:'err',msg:'group belong to other merchant:' + oldGroup.merchantId};
        out.print(JSON.stringify(ret));
    }
    else{
        SaasUserGroupService.removeUserGroup(oldGroup);
        var result = {state:"ok"};
        out.print(JSON.stringify(result));
    }
})();