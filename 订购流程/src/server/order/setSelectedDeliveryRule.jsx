//#import Util.js
//#import login.js
//#import address.js
//#import session.js


(function () {
    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }
    if (!buyerId) {
        var ret = {
            state: 'err',
            msg: "用户不存在！"
        }
        out.print(JSON.stringify(ret));
    }
    else {
        var addressId = $.params.addressId;
        var ruleId = $.params.ruleId;
        var merchantId = $.params.merchantId;

        AddressService.setSelectedDeliveryRuleId(buyerId,addressId,merchantId,ruleId);
        var ret = {
            state:"ok"
        }
        out.print(JSON.stringify(ret));
    }
})();

