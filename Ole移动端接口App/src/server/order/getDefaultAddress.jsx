//#import Util.js
//#import login.js
//#import address.js
//#import session.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var userId = LoginService.getFrontendUserId();
    response.setContentType("application/json");
    if (!userId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }

    var serverTime = new Date().getTime();
    var defaultAddress = AddressService.getDefaultAddress(userId);
    if (defaultAddress) {
        if (defaultAddress.selectedDeliveryRuleIds) {
            regionId = defaultAddress.regionId;
            //不要把所有商户里选择的配送方式发送到客户端
            defaultAddress.selectedDeliveryRuleIds = null;
        }
        if (!defaultAddress.regionName) {
            defaultAddress.regionName = SaasRegionService.getFullPathString(defaultAddress.regionId);
        }
        if (defaultAddress.certificate) {
            //解密身份证信息
            defaultAddress.certificate = Md5Service.decString(defaultAddress.certificate, "!@#$%^") + "";
        }
        ret.data = {
            address: defaultAddress
        };
        out.print(JSON.stringify(ret));
    } else {
        ret = ErrorCode.order.E1M01016;
        out.print(JSON.stringify(ret));
    }
})();


