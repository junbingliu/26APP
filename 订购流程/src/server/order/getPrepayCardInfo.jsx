//#import Util.js
//#import storeCard.js
//#import login.js
//#import session.js

(function () {
    var cardNo = $.params.cardNo;
    var password = $.params.password;
    var safeCode = $.params.safeCode;

    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        var ret = {
            state: "err",
            msg: "您还未登录"
        };
        out.print(JSON.stringify(ret));
        return;
    }
    if(!cardNo || !password){
        var ret = {
            state: "err",
            msg: "请输入卡号或密码"
        };
        out.print(JSON.stringify(ret));
        return;
    }
    var bindUserId = StoreCardService.getUserIdByCardNo(cardNo);
    if(bindUserId != "" && bindUserId && bindUserId != "null" && bindUserId != userId){
        var ret = {
            state: "err",
            msg: "此卡已经被他人绑定,不能使用"
        };
        out.print(JSON.stringify(ret));
        return;
    }

    var info = StoreCardService.getCashCardInfo(cardNo, password, safeCode);
    if (info.status != '0') {
        var msg = info.msg;
        if (info.status != '-4') {
            if (msg.indexOf("该卡不需要密码") > -1) {
                msg = "非加密卡，不支持线上支付，可在自提点刷卡";
            }
        }
        var ret = {
            state: "err",
            msg: msg
        };
        out.print(JSON.stringify(ret));

    }
    else {
        var cardInfo = JSON.parse(info.msg);
        var remainAmount = cardInfo.remainAmount;

        var ret = {
            state: "ok",
            cardNo: cardNo,
            remainAmount: remainAmount
        };
        out.print(JSON.stringify(ret));
    }
})();




