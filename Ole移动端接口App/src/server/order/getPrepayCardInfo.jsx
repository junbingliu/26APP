//#import Util.js
//#import storeCard.js
//#import login.js
//#import session.js
//#import base64.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var cardNo = $.params.cardNo;
    var password = $.params.password;
    var safeCode = $.params.safeCode;

    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!cardNo || !password) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    cardNo = Base64.decode(cardNo);//base64解码
    password = Base64.decode(password);//base64解码
    var bindUserId = StoreCardService.getUserIdByCardNo(cardNo);
    if (bindUserId != "" && bindUserId && bindUserId != "null" && bindUserId != userId) {
        ret = ErrorCode.order.E1M01017;
        out.print(JSON.stringify(ret));
        return;
    }

    var info = StoreCardService.getCashCardInfo(cardNo, password, safeCode);
    if (info.status != '0') {
        var msg = info.msg;
        if (info.status != '-4') {
            if (msg.indexOf("该卡不需要密码") > -1) {
                ret = ErrorCode.order.E1M01018;
                msg = "非加密卡，不支持线上支付，可在自提点刷卡";
            } else {
                ret = ErrorCode.order.E1M01018;
                ret.msg = msg;
            }
        }
        out.print(JSON.stringify(ret));
    } else {
        var cardInfo = JSON.parse(info.msg);
        var remainAmount = cardInfo.remainAmount;
        ret.data = {
            cardNo: cardNo,
            remainAmount: remainAmount
        };
        out.print(JSON.stringify(ret));
    }
})();




