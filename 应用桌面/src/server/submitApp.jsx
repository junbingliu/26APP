//#import Util.js
//#import login.js
//#import $productBatchUp:services/productBatchUp.jsx

(function(){
    var m = $.params.m;
    var loginUserId = LoginService.getBackEndLoginUserId();
    var appStr = $.params.appStr;
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



    var app = JSON.parse(appStr);

    if(!app.id){
        app.submitUserId = loginUserId;
        var now = new Date();
        app.submitDate = now.getTime();
        app.merchantId = m;

        var r = ProductBatchUpService.addApplication(m,app);
        var ret = {
            state:'ok',
            id: r.id,
            submitDate: r.submitDate
        }
        out.print(JSON.stringify(ret));
    }
    else{
        var oldApp = ProductBatchUpService.getById(app.id);
        if(oldApp.certifyState=='certified'){
            var ret = {
                state:'err',
                msg:"已经审批的申请不能修改。"
            }
            out.print(JSON.stringify(ret));
        }
        else{
            var r = ProductBatchUpService.updateApplication(app.id,app);
            var ret = {
                state:'ok',
                id: r.id,
                submitDate: r.submitDate
            }
            out.print(JSON.stringify(ret));
        }

    }
})();



