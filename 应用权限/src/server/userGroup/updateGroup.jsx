//#import Util.js
//#import SaasUserGroup.js

(function(){
    var m = $.params['m'];
    if(!m){
        m="m_100";
    }
    var g = $.params['g'];
    var name = $.params['n'];
    var description = $.params['d'];
    var group = {name:name,description:description,merchantId:m,id:g}
    var oldGroup = SaasUserGroupService.getSaasUserGroup(g);
    if(oldGroup.merchantId!=m){
       var ret = {state:'err',msg:'group belong to other merchant:' + oldGroup.merchantId};
       out.print(JSON.stringify(ret));
    }
    else{
        group.parentId = oldGroup.parentId;
        SaasUserGroupService.updateUserGroup(group);
        var result = {state:"ok"};
        out.print(JSON.stringify(result));
    }
})();