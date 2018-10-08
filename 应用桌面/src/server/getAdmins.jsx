//#import Util.js
//#import admin.js

var m = $.params.m;
var admins = AdminService.getAllAdminsByMerchant(m);
admins = admins.map(function(admin){
    return{
        id:admin.id,
        name:admin.realName?admin.realName:admin.loginId
    }
});
var ret = {
    state:"ok",
    admins:admins
};
out.print(JSON.stringify(ret));

