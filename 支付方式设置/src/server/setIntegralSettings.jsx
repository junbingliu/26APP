//#import Util.js
//#import account.js

var integralMoneyRatio = $.params.integralMoneyRatio;
var supportNegativeIntegral = $.params.supportNegativeIntegral;

AccountService.setIntegralMoneyRatio(integralMoneyRatio);
AccountService.setAllowMerchantNegativeIntegral(supportNegativeIntegral);

var ret = {
    state:"ok"
}
out.print(JSON.stringify(ret));