//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js

(function () {
    response.setContentType("application/json");
    var ret = {
        state: 'err',
        msg: ""
    };

    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();

    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }

    if (!buyerId) {
        var ret = {
            state: 'err',
            msg: "用户不存在"
        };
        out.print(JSON.stringify(ret));
    }

    var addressId = $.params.addressId;
    AddressService.setDefaultAddress(buyerId, addressId);

    var ret = {
        state:"ok"

    }
    out.print(JSON.stringify(ret));

})();