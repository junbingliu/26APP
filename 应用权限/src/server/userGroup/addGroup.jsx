//#import Util.js
//#import SaasUserGroup.js

(function(){
        var m = $.params['m'];
        if(!m){
            m=$.getDefaultMerchantId();
        }
        var parent = $.params['p'];
        var name = $.params['n'];
        var description = $.params['d'];
        var group = {name:name,description:description,parentId:parent,merchantId:m}
        var id = SaasUserGroupService.addUserGroup(group);
        var result = {state:"ok",id:id}
        out.print(JSON.stringify(result));

})();