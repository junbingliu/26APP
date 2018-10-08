//#import Util.js
//#import SaasActionGroup.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var groups=SaasActionGroupService.getAllCustomActionGroups(merchant);
groups=groups.map(function(group){
     group.show=true;
    return group;
})

var ret = {state:"ok",groups:groups};
out.print(JSON.stringify(ret));