//#import Util.js
//#import address.js
//#import login.js
//#import saasRegion.js
//#import sysArgument.js
//#import session.js
//#import statistics.js

(function () {
    var ret = {
        code: 'E1B040003',
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
            var userName = $.params.userName;//收货人姓名
            var regionId = $.params.regionId;//地区ID
            var addressInfo = $.params.address;//详细地址
            var telePhone = $.params.phone;//收货人手机
            var mobilePhone = $.params.mobile;//电话号码
            var postalCode = $.params.postalCode || "";//邮编
            var longitude = $.params.userLongitude || "";//经纬度
            var subdistrict = $.params.subdistrict || "";//小区
            var houseNumber = $.params.houseNumber || "";//门牌号
            var isdefault = $.params.isDefault;//默认地址

            //在给地址做验证的时候，先过滤掉一些特殊字符
            if(!addressInfo || addressInfo == null){
                ret.msg = "详细收货地址不能为空";
                out.print(JSON.stringify(ret));
                return;
            }
            var specialCodeReg = /[`~·!@$%^&*+={}\[\]|\\;:'\",<>/?]/g;
            if (addressInfo) {
                addressInfo = addressInfo.replace(specialCodeReg, "");
            }

            var addressReg = "^[\u4E00-\u9FA5A-Za-z0-9-_（）\(\).#]{1,50}$";//收货地址正则表达式，只是能汉字，数字，字母，下划线和中划线
            if (!addressInfo.trim().match(addressReg)) {
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
            if(!telePhone || telePhone == null){
                ret.msg = "收货人手机号不能为空!";
                out.print(JSON.stringify(ret));
                return;
            }
            if (!mobileRegex.test(telePhone)) {
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
            if (!userName.match(/^[\u4E00-\u9FA5a-zA-Z0-9.]{1,10}$/)) {
                ret.msg = "收货人姓名格式错误，收货人姓名只能是汉字、字母、数字或英文句号(.),长度不能超过10！";
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
            if (!addressId || addressId == null || addressId == 'none') {
                addressId = "";
            }
            var oldAddress = null;
            if (addressId) {
                oldAddress = AddressService.getAddressById(buyerId, addressId);
            }
            //去空格
            userName = userName && userName.trim();
            postalCode = postalCode && postalCode.trim();
            addressInfo = addressInfo && addressInfo.trim();
            var address = {
                id: addressId,
                userName: userName,
                regionId: regionId,
                address: addressInfo,
                phone: telePhone,
                mobile: mobilePhone,
                postalCode: postalCode,
                regionName: regionName,
                userLongitude: longitude,
                subdistrict: subdistrict,
                houseNumber: houseNumber
            };
            //修改地址只覆盖新修改的字段,原来保存的数据不能丢如:选中的配置规则,配送时间
            if (oldAddress) {
                for (var k in address) {
                    oldAddress[k] = address[k];
                }
                address = oldAddress;
            }
            addressId = AddressService.saveAddress(buyerId, address);
            //如果设置为默认地址，则调用设置默认地址接口
            if(isdefault == "true"){
                AddressService.setDefaultAddress(buyerId, addressId);
            }
            //统计修改地址数据
            //StatisticsUtil.track(buyerId, "save_address", {});
            ret.code = "S0A00000";
            ret.msg = "保存收货地址成功";
            ret.data = addressId;
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret.msg = "保存收货地址失败";
        out.print(JSON.stringify(ret));
    }

})();

