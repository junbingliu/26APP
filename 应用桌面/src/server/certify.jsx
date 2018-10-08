//#import Util.js
//#import login.js
//#import $productBatchUp:services/productBatchUp.jsx

(function(){
    var m = $.params.m;
    var loginUserId = LoginService.getBackEndLoginUserId();
    if(loginUserId!='u_0'){
        var privilege = ProductBatchUpService.getPrivilege(m);
        if(!privilege || privilege.certifyUserIds.indexOf(loginUserId)==-1){
            var ret = {
                state:'err',
                msg:"没有权限。"
            }
            out.print(JSON.stringify(ret));
            return;
        }
    }

    var id = $.params.id;

//TODO:检查权限
    ProductBatchUpService.certify(id,loginUserId);
    var ret = {
        state:"ok"
    }
    out.print(JSON.stringify(ret));

})();


