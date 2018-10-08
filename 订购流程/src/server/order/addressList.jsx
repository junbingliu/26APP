//#import Util.js
//#import address.js
//#import login.js
//#import session.js
//#import md5Service.js

var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
if (!buyerId) {
    buyerId = LoginService.getFrontendUserId();
}
if (!buyerId) {
    var ret = {
        state: 'err',
        msg: "用户不存在！"
    };
    out.print(JSON.stringify(ret));
} else {
    var addressList = AddressService.getAllAddresses(buyerId);
    if(addressList && addressList.length > 0){
        for(var i = 0;i<addressList.length;i++){
            var address = addressList[i];
            if (address.certificate) {
                //解密身份证信息
                address.certificate = Md5Service.decString(address.certificate, "!@#$%^") + "";
            }
        }
    }
    var ret = {
        state: 'ok',
        addressList: addressList
    };
    out.print(JSON.stringify(ret));
}

