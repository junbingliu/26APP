//#import Util.js
//#import $shell20:service/service.jsx
//#import $merchantOperator:services/merchantOperatorService.jsx
//#import login.js
//#import user.js


(function(){
  var scanCode = $.params.s;
  var m = $.params.m;
  var data = Shell20Service.getScanCodeData(scanCode);
  if(data && data.userId){
    Shell20Service.saveScanCodeData(scanCode,null);
    MerchantOperatorService.addOperator(m,data.userId);
  }
  var ops = MerchantOperatorService.getOpsOfMerchant(m);
  var users = UserService.getUsers(ops);
  var opUsers = [];
  if(users){
    opUsers = users.map(function(u){
      return {id:u.id,name:u.realName||u.nickName,logo:u.logo}
    });
  }
  var ret = {
    state:'ok',
    users:opUsers
  }

  out.print(JSON.stringify(ret));


})();