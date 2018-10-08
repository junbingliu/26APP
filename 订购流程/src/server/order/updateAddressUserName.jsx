//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import md5Service.js

(function(){
    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }
    var ret = {
        state: 'err',
        msg: ""
    };
    if (!buyerId) {
        ret.msg = "用户不存在！";
        out.print(JSON.stringify(ret));
    }
    else {
        var addressId = $.params.addressId;
        var userName = $.params.userName;
        var certificate = $.params.certificate;
        if(!addressId){
            ret.msg = "地址ID为空！";
            out.print(JSON.stringify(ret));
            return;
        }
        if (!userName || userName.trim().length == 0) {
            ret.msg = "收货人姓名不能为空,请填写收货人姓名！";
            out.print(JSON.stringify(ret));
            return;
        }
        if(!userName.match( /^[\u4E00-\u9FA5a-zA-Z.]{2,10}$/)){
            ret.msg = "收货人姓名格式错误，收货人姓名只能是汉字、字母或英文句号(.),长度不能超过10！";
            out.print(JSON.stringify(ret));
            return;
        }

        //判断字符串长度，如果是中文则是一个字符，两个长度
        var strLength = function (str) {
            if (!str) {
                return 0;
            }
            var len = 0;
            for (var i = 0; i < str.length; i++) {
                var c = str.charCodeAt(i);
                //单字节加1
                if ((c >= 0x0001 && c <= 0x007e) || (0xff60 <= c && c <= 0xff9f)) {
                    len++;
                }
                else {
                    len += 2;
                }
            }
            return len;
        };
        if (userName && userName.length > 20 || strLength(userName) > 20) {
            ret.msg = "收货人姓名超出20个字符。现在长度:" + strLength(userName);
            out.print(JSON.stringify(ret));
            return;
        }
        if(userName&&userName.length>20){
            ret.msg = "收货人姓名超出20个字符！";
            out.print(JSON.stringify(ret));
            return;
        }
        if(certificate){
            var reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            if (reg.test(certificate) === false) {
                ret.msg = "身份证格式错误！";
                out.print(JSON.stringify(ret));
                return;
            }
        }
        var addressId = $.params.addressId;
        if(addressId=='none'){
            addressId="";
        }
        var oldAddress = null;
        if(addressId){
            oldAddress = AddressService.getAddressById(buyerId,addressId);
        }
        //去空格
        userName = userName && userName.trim();
        var address = {
            userName:userName
        };
        if(certificate){
            address.certificate = Md5Service.encString(certificate,"!@#$%^") + "";
        }
        //修改地址只覆盖新修改的字段,原来保存的数据不能丢如:选中的配置规则,配送时间
        if(oldAddress){
            for(var k in address){
                oldAddress[k] = address[k];
            }
            address = oldAddress;
        }
        addressId = AddressService.saveAddress(buyerId,address);
        AddressService.setDefaultAddress(buyerId, addressId);
        var ret ={
            state:'ok',
            addressId:addressId
        };
        out.print(JSON.stringify(ret));
    }
})();

