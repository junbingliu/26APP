//#import Util.js
//#import account.js

var integralMoneyRatio = AccountService.getIntegralMoneyRatio();
var supportNegativeIntegral = AccountService.getAllowMerchantNegativeIntegral();

var ret = {
    state : "ok",
    integralMoneyRatio : integralMoneyRatio,
    supportNegativeIntegral : supportNegativeIntegral
}
out.print(JSON.stringify(ret));