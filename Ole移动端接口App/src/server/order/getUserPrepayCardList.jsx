//#import Util.js
//#import login.js
//#import session.js
//#import storeCard.js
//#import @server/util/ErrorCode.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var result;
    try {
        result = StoreCardService.getUserCardList(userId, 1, 10);
    } catch (e) {
        $.log("............获取会员绑定的预付卡出错,错误信息:" + e + "..................");
    }
    try {
        if (result && result.total > 0) {
            var cards = result.records;
            var returnCards = [];
            for (var i = 0; i < cards.length; i++) {
                var cardNo = cards[i];
                var card = {};
                card.cardNo = cardNo;
                try { //获取卡余额
                    var info = StoreCardService.getCashCardInfo(cardNo, '', '');
                    $.info(cardNo + ",获取礼品卡返回信息:" + JSON.stringify(info));
                    if (info.status == '0') {
                        var cardInfo = JSON.parse(info.msg);
                        //余额大于0的才需要显示
                        if (Number(cardInfo.remainAmount) > 0) {
                            card["remainAmount"] = cardInfo.remainAmount;
                        } else {
                            result.total--;
                            continue;
                        }
                        card.loadState = 'ok';
                    } else {
                        card["remainAmount"] = 0;
                        card.loadState = 'err';
                    }
                } catch (e) {
                    card["remainAmount"] = 0;
                    $.error("获取礼品卡余额失败......:" + cardNo);
                }
                card.logo = "http://10.0.147.163/img/2017/8/3/95302458235232566884241.png";//todo 改logo
                returnCards.push(card);
            }
            ret.data = {
                total: result.total,
                cards: returnCards
            };
            out.print(JSON.stringify(ret));
        } else {
            ret.data = {
                total: 0,
                cards: []
            };
            out.print(JSON.stringify(ret));
        }
    } catch (e) {
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
        return;
    }
})();