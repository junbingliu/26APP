//#import Util.js
//#import SaasRoleAssign.js
//#import merchant.js
//#import $merchantOperator:services/merchantOperatorService.jsx


var hasPrivilege = false;
if(actionGroupId.indexOf(",")>-1){
    var actionGroupIds = actionGroupId.split(",");
    var hasPrivilege = SaasRoleAssignService.checkAnyPrivileges(userId,merchantId,appId,actionGroupIds);
}
else{
    var hasPrivilege = SaasRoleAssignService.checkPrivilege(userId,merchantId,appId,actionGroupId);
}
try{
    if(!hasPrivilege && (typeof MerchantOperatorService!='undefined')){
        //如果是saas的店主,则有权限
        var userMerId = MerchantService.getMerchantIdByApplyUserId(userId);
        if(userMerId==merchantId){
            hasPrivilege = true;
        }
        else{
            //
            var ops = MerchantOperatorService.getOpsOfMerchant(merchantId);
            if(ops && ops.indexOf(userId)>=0){
                hasPrivilege = true;
            }
        }
    }
}
catch(e){

}

request.setAttribute("_return",hasPrivilege);
