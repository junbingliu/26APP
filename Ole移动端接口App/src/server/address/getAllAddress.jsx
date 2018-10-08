//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B040002',
        msg: ""
    };
    try {
        var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
        if (!buyerId) {
            buyerId = LoginService.getFrontendUserId();
        }
        //var buyerId = "u_4110001";
        if (!buyerId) {
            ret.msg = "用户不存在！";
            out.print(JSON.stringify(ret));
        } else {
            var addressList = AddressService.getAllAddresses(buyerId);
            ret.code = "S0A00000";
            ret.data = addressList;
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "查询所有地址失败";
        out.print(JSON.stringify(ret));
    }

})();

