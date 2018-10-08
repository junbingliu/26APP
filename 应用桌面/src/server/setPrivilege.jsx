//#import Util.js
//#import login.js
//#import $productBatchUp:services/productBatchUp.jsx



(function(){
    var m = $.params.m;
    var loginUserId = LoginService.getBackEndLoginUserId();
    if(loginUserId!='u_0' && loginUserId!='u_1'){
        var privilege = ProductBatchUpService.getPrivilege(m);
        if(!privilege || privilege.privilegedUserIds.indexOf(loginUserId)==-1){
            var ret = {
                state:'err',
                msg:"没有权限。"
            }
            out.print(JSON.stringify(ret));
            return;
        }
    }

    var privilege = JSON.parse($.params.privilege);
    ProductBatchUpService.setPrivilege(m,privilege.submitAppUserIds,privilege.certifyUserIds,privilege.privilegedUserIds);

    var ret = {state:"ok"};
    out.print(JSON.stringify(ret));
})();

