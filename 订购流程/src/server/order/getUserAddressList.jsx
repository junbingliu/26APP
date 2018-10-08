//#import Util.js
//#import address.js
//#import login.js
//#import session.js

(function () {
    var userToken = $.params['userToken'];
    if (!userToken) {
        var ret = {
            state: 'err',
            msg: "参数不能为空！"
        };
        out.print(JSON.stringify(ret));
    } else {
        var selfApi = new JavaImporter(
            Packages.net.xinshi.isone.commons.Base64Coder
        );
        try {
            var buyerId;
            //解密后应该是这样的格式：userid=u_3220036;isid=qweuqiowurqiowueioqwueoiqwueioqwueqoiweu;timestring=1445425025573
            var decodeStr = selfApi.Base64Coder.decode(userToken);
            var decodeArray = decodeStr.split(";");
            for (var i = 0; i < decodeArray.length; i++) {
                var values = decodeArray[0].split("=");
                var key = values[0];//userId
                if (key == "userid" && values.length > 1) {
                    buyerId = values[1];
                    break;
                }
            }
            if (!buyerId) {
                var ret = {
                    state: 'err',
                    msg: "用户不存在！"
                };
                out.print(JSON.stringify(ret));
                return;
            }

            var addressList = AddressService.getAllAddresses(buyerId);
            var ret = {
                state: 'ok',
                addressList: addressList
            };
            out.print(JSON.stringify(ret));
        } catch (e) {
            var ret = {
                state: 'err',
                msg: "用户不存在！"
            };
            out.print(JSON.stringify(ret));
        }
    }
})();