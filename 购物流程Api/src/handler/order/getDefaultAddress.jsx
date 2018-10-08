/*
返回用户的默认收货地址
 */

//#import Util.js
//#import login.js
//#import address.js
//#import session.js

(function(){
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    response.setContentType("application/json");
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin"};
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
        var ret = {
            state: "ok",
            userId:userId,
            deliveryAddress: defaultAddress
        }
        out.print(JSON.stringify(ret));
    }
    else{
        var ret = {
            state:"empty",
            userId:userId
        }
        out.print(JSON.stringify(ret));
    }


})();


