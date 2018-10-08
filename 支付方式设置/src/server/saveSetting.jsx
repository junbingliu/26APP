//#import Util.js
//#import login.js
//#import merchant.js
//#import $paymentSetting:services/paymentSettingService.jsx

var merchantId = $.params.theMerchantId;
var inheritPlatform = $.params.inheritPlatform;

if(inheritPlatform=='Y'){
    inheritPlatform = true;
}
else{
    inheritPlatform = false;
}

PaymentSettingService.setInheritPlatform(merchantId,inheritPlatform);
var inheritPlatform = PaymentSettingService.getInheritPlatform(merchantId);
var ret = {
    state:'ok',
    inheritPlatform:inheritPlatform
}
out.print(JSON.stringify(ret));
