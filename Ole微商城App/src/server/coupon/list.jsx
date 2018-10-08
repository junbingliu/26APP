//#import Util.js
//#import pigeon.js
//#import card.js
//#import cardBatch.js
//#import login.js
//#import user.js
//#import file.js
//#import DateUtil.js
//#import $oleMobileApi:server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx

/**
 * 优惠券列表接口，个人中心用到
 */
(function () {
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000003);
        return
    }
    var page = Number($.params["page"]) || 1;
    var limit = Number($.params["limit"]) || 10;

    var searchArgs = {};
    var innerTypeId = "cardType_coupons";
    var canUseState = $.params["canUseState"] || "Y";//Y：可用，N：不可用
    var fields = "cardNumber,amount,effectedBegin,effectedEnd,cardBatchId,canceled,activated,presentStatus,boundUserId,presentUserId";
    var now = new Date();
    var time = now.getTime();

    searchArgs.cardchannel = "ole";
    searchArgs.canUse = canUseState;
    searchArgs.innerTypeId = innerTypeId;
    // searchArgs.userId = loginUserId;
    searchArgs.ownerId = loginUserId;
    searchArgs.fields = fields;
    searchArgs.page = page;
    searchArgs.page_size = limit;
    var cardList = CardService.searchCards(searchArgs);
    var cards = cardList.cards;

    for (var i = 0; i < cards.length; i++) {
        var cardObj1 = CardBatchService.getCardBatchById(cards[i].cardBatchId);
        var jCard = cards[i];
        // jCard.ruleRemarkDes = cardObj1.ruleRemarkDes || "";
        jCard.outerName = cardObj1.outerName || "";
        jCard.desc = cardObj1.desc || "";
        jCard.imgUrl = "";
        if (cardObj1.fileId) {
            jCard.imgUrl = FileService.getFullPath(cardObj1.fileId) || "";
        }
        jCard.state = "0";//卡券的状态，0，可以作用，1，已使用，2，已过期
        if (jCard.canceled == "1") {//已作废
            jCard.state = "1";//已使用
        } else if (jCard.canceled == "0" && DateUtil.getLongTimeByFormat(cards[i].effectedEnd, "yyyy-MM-dd HH:mm:ss") < time) {
            jCard.state = "2";//已过期
        }
        jCard.effectedBegin = jCard.effectedBegin && jCard.effectedBegin.split(" ")[0] || "";
        jCard.effectedEnd = jCard.effectedEnd && jCard.effectedEnd.split(" ")[0] || "";
        jCard.canPresent = cardObj1.canPresent || "N";//Y可以转赠，N:不可以转赠
        if (jCard.presentStatus == "2") {
            var boundUserId = jCard.boundUserId;//绑定人
            var jUser = UserService.getUser(boundUserId);
            if (jUser) {
                jCard.presentUserName = jUser.realName || jUser.loginId || jUser.mobilPhone || jUser.mobil || "";
            }
        }
        delete jCard.cardBatchId;
    }
    var data = {
        list: cards,
        total: cardList.total
    };
    H5CommonUtil.setSuccessResult(data);
})();