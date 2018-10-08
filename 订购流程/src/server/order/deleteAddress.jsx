//#import Util.js
//#import address.js
//#import login.js
//#import session.js

(function () {
    var buyerId = SessionService.getSessionValue("orderUserId", request) || $.params.buyerId;
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
        var address = $.params.addressId;
        AddressService.deleteAddress(buyerId, address);
        var ret = {
            state: 'ok'
        }
        out.print(JSON.stringify(ret));
    }
})();