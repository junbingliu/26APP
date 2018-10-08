//#import Util.js
//#import $shell20:service/service.jsx
//#import $merchantOperator:services/merchantOperatorService.jsx
//#import login.js
//#import user.js


(function(){
  var m = $.params.m;
  var userId = $.params.userId;

  MerchantOperatorService.removeOperator(m,userId);

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