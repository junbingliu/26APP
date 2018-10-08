//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B040001',
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
            return;
        } else {
            var addressId = $.params.addressId;//收货地址ID

            if (!addressId || addressId == null || addressId == 'none') {
                ret.msg = "收货地址ID不能为空";
                out.print(JSON.stringify(ret));
                return;
            }

            AddressService.deleteAddress(buyerId, addressId);
            //统计修改地址数据
            //StatisticsUtil.track(buyerId, "delete_address", {});
            ret.code = "S0A00000";
            ret.msg = "删除地址成功";
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "删除地址失败";
        out.print(JSON.stringify(ret));
    }

})();

