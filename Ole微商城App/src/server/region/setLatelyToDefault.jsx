//#import Util.js
//#import login.js
//#import address.js
//#import @server/util/H5CommonUtil.jsx
(function () {
    var loginUserId = LoginService.getFrontendUserId();

    if (!loginUserId) {
        H5CommonUtil.setLoginErrorResult("请先登录");
        return;
    }
    try {
        var addressList = AddressService.getAllAddresses(loginUserId);
        if (addressList && addressList.length > 0) {
            var addressObj = addressList[addressList.length - 1];
            AddressService.setDefaultAddress(loginUserId, addressObj.id);
        }
        H5CommonUtil.setSuccessResult({});

    } catch (e) {
        H5CommonUtil.setExceptionResult("系统异常");
    }


})();