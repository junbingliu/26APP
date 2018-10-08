//#import Util.js
//#import login.js
//#import merchantAccounts.js

var userName = $.params['userName'];
var password = $.params['password'];
var validateCode = $.params['validateCode'];



var result = LoginService.loginBackend(userName,password,validateCode);

if(result.state){
    var merchantId = $.params.m;
    var adminId = result.userId;
    if(adminId=='u_0'){
        merchantId = "head_merchant";
    }
    else if(adminId=="u_1"){
        merchantId = "m_100";
    }
    if(!merchantId){
        var merchants = MerchantAccountService.getMerchantsOfAdmin(adminId);
        $.log(JSON.stringify(merchants));
        if(merchants.length>0){
            merchantId = merchants[0].objId;
        }
    }
    if(!merchantId){
        merchantId = $.getDefaultMerchantId();
    }
    var result = {
        state:'ok',
        merchantId:merchantId
    }
    out.print(JSON.stringify(result));
}
else{
    var result = {
        state:'err',
        msg:'登录失败'
    }
    out.print(JSON.stringify(result));
}