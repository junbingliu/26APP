//#import Util.js
//#import SaasActionGroup.js

var merchant = $.params['m'];
if(!merchant){
    merchant = 'm_100';
}

var g = $.params['g'];
var group = JSON.parse(g);
group.merchantId = merchant;

var id = SaasActionGroupService.addActionGroup(group);
var ret = {state:"ok",id:id};
out.print(JSON.stringify(ret));