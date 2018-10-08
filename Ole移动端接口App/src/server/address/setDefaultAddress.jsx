//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B040004',
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
            ret.data = "false";
            out.print(JSON.stringify(ret));
        } else {
            var addressId = $.params.addressId;//收货地址ID

            if (!addressId || addressId == null || addressId == 'none') {
                ret.msg = "收货地址ID不能为空";
                ret.data = "false";
                out.print(JSON.stringify(ret));
                return;
            }

            AddressService.setDefaultAddress(buyerId, addressId);
            //统计修改地址数据
            //StatisticsUtil.track(buyerId, "set_default_address", {});
            ret.code = "S0A00000";
            ret.msg = "默认地址设置成功";
            ret.data = "true";
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "默认地址设置失败";
        ret.data = "false";
        out.print(JSON.stringify(ret));
    }

})();

