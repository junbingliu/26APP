//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js

(function () {
    var ret = {
        state: 'err',
        msg: ""
    };
    var buyerId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!buyerId) {
        buyerId = LoginService.getFrontendUserId();
    }
    if (!buyerId) {
        ret.msg = "用户不存在！";
        out.print(JSON.stringify(ret));
    } else {
        var phone = $.params.phone;//电话
        var streetAddress = $.params.address || "";//详细地址
        var postalCode = $.params.postalCode;//邮编
        var mobile = $.params.mobile;//收货人手机
        var regionId = $.params.regionId;//地区ID
        var userName = $.params.userName;//收货人姓名

        var subdistrict = $.params.subdistrict || "";//小区
        var houseNumber = $.params.houseNumber || "";//门牌号
        var userLongitude = $.params.userLongitude || "";//经纬度

        if(subdistrict || houseNumber){
            streetAddress = subdistrict + houseNumber;//如果有填写小区和门牌号，则把详细地址替换成小区+门牌号
        }

        var addressReg = "^[\u4E00-\u9FA5A-Za-z0-9-_（）\(\).]{2,50}$";//收货地址正则表达式，只是能汉字，数字，字母，下划线和中划线
        if(!streetAddress.trim().match(addressReg)){
            ret.msg = "收货地址不能包含特殊字符，只能是汉字、数字、字母、下划线和中划线,并且长度不能小于2大于50。";
            out.print(JSON.stringify(ret));
            return;
        }

        if (!regionId) {
            ret.msg = "没有指定地区。";
            out.print(JSON.stringify(ret));
            return;
        }
        var mobileRegex = new RegExp(SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "regex_Mobile"));
        if (!mobileRegex.test(mobile)) {
            ret.msg = "手机号格式不正确。";
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
        if (userName && userName.length > 20 || strLength(userName) > 20) {
            ret.msg = "收货人姓名超出20个字符。现在长度:" + strLength(userName);
            out.print(JSON.stringify(ret));
            return;
        }
        if (postalCode && postalCode.length > 6) {
            ret.msg = "邮政编码超出6个字符！";
            out.print(JSON.stringify(ret));
            return;
        }
        var regionName = SaasRegionService.getFullPathString(regionId);
        var addressId = $.params.addressId;
        if (addressId == 'none') {
            addressId = "";
        }
        var oldAddress = null;
        if (addressId) {
            oldAddress = AddressService.getAddressById(buyerId, addressId);
        }
        //去空格
        userName = userName && userName.trim();
        postalCode = postalCode && postalCode.trim();
        streetAddress = streetAddress && streetAddress.trim();
        var address = {
            id: addressId,
            regionId: regionId,
            phone: phone,
            postalCode: postalCode,
            mobile: mobile,
            address: streetAddress,
            userName: userName,
            regionName: regionName,
            subdistrict: subdistrict,
            houseNumber: houseNumber,
            userLongitude: userLongitude
        };
        //修改地址只覆盖新修改的字段,原来保存的数据不能丢如:选中的配置规则,配送时间
        if (oldAddress) {
            for (var k in address) {
                oldAddress[k] = address[k];
            }
            address = oldAddress;
        }
        addressId = AddressService.saveAddress(buyerId, address);
        AddressService.setDefaultAddress(buyerId, addressId);
        ret.state = "ok";
        ret.addressId = addressId;
        out.print(JSON.stringify(ret));
    }
})();

