//#import Util.js
//#import login.js
//#import address.js
;
(function () {
    var loginUserId = LoginService.getFrontendUserId();
    var ret = {};
    if (!loginUserId) {
        H5CommonUtil.setLoginErrorResult("请先登录");
        return;
    }
    try {
        var addressId = $.params.addressId;
        AddressService.setDefaultAddress(loginUserId, addressId);
        ret = {
            code: 'S0A00000',
            msg: '操作成功',
            data: null
        };
        out.print(JSON.stringify(ret));

    } catch (e) {
        ret = {
            code: 'E1M000002',
            msg: '系统异常',
            data: null
        };
        out.print(JSON.stringify(ret));
    }


})();