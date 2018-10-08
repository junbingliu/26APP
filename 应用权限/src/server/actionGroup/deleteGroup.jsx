//#import Util.js
//#import SaasActionGroup.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

try{
    var g = $.params['g'];
    var id = SaasActionGroupService.deleteActionGroup(g);
    var ret = {state:"ok"};
    out.print(JSON.stringify(ret));
}
catch(e){
    var ret = {state:"err",msg:e}
    out.print(JSON.stringify(ret));
}