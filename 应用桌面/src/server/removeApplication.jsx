//#import Util.js
//#import login.js
//#import $productBatchUp:services/productBatchUp.jsx

(function(){
    var m = $.params.m;
    var loginUserId = LoginService.getBackEndLoginUserId();
    if(loginUserId!='u_0'){
        var privilege = ProductBatchUpService.getPrivilege(m);
        if(!privilege || privilege.submitAppUserIds.indexOf(loginUserId)==-1){
            var ret = {
                state:'err',
                msg:"没有权限。"
            }
            out.print(JSON.stringify(ret));
            return;
        }
    }
    var id = $.params.id;
    var oldApp =  ProductBatchUpService.getById(id);
    if(oldApp!=null){
        $.log("oldApp.certifyState=" + oldApp.certifyState);
        $.log("oldApp.runState=" + oldApp.runState!='executed')
        if(oldApp.certifyState=='certified' && oldApp.runState!='executed'){
            var ret = {
                state:'err',
                msg:"已经审批，还没执行的申请不能删除。"
            }
            out.print(JSON.stringify(ret));
            return;
        }
    }

    ProductBatchUpService.removeApplication(id);
    var ret={
        state:"ok",
        msg:"删除完成。"
    }
    out.print(JSON.stringify(ret));
})();



