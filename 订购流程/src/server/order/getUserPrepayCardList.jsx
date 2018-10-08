//#import Util.js
//#import storeCard.js
//#import login.js
//#import session.js

(function () {
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();

    var result;
    try {
        result = StoreCardService.getUserCardList(userId, 1, 10);
    } catch (e) {
        $.log("............获取会员绑定的预付卡出错,错误信息:"+e+"..................");
    }
    if (result && result.total > 0) {
        var cards = result.records;
        var returnCards = [];
        for (var i = 0; i < cards.length; i++) {
            var cardNo = cards[i];
            var card = {};
            card.cardNo = cardNo;
            //获取卡余额
            /* var info = StoreCardService.getCashCardInfo(cardNo, '', '');
             if (info.status == '0') {
             var cardInfo = JSON.parse(info.msg);
             //余额大于0的才需要显示
             if (Number(cardInfo.remainAmount) > 0) {
             card["remainAmount"] = cardInfo.remainAmount;
             }else{
             result.total--;
             continue;
             }
             card.loadState = 'ok';
             }else{
             card.loadState = 'err';
             }*/
            returnCards.push(card);
        }

        var ret = {
            total: result.total,
            cards: returnCards
        };
        out.print(JSON.stringify(ret));
    } else {
        var ret = {
            total: 0,
            cards: []
        };
        out.print(JSON.stringify(ret));
    }
})();