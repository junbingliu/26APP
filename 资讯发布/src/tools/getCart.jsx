//#import Util.js
//#import user.js
//#import login.js
//#import card.js
//#import DateUtil.js
(function () {
    var userId = $.params["loginId"];
    if(!userId){
        userId = LoginService.getFrontendUserId();
    }
    var start = $.params["start"] || 1;
    var limit = $.params["limit"] || 10;
    var searchArgs = {};
    var innerTypeId = "cardType_coupons";
    var canceled = $.params["canceled"] || "0";
    var voucherList = [];
    searchArgs.canceled=canceled;
    searchArgs.innerTypeId = innerTypeId;
    searchArgs.userId = userId;
    searchArgs.page=start;
    searchArgs.page_size= limit;
    var cardList = CardService.searchCards(searchArgs);
    var total = cardList.total;
    var cards = cardList.cards;
    var ecardList = {};
    var now = new Date();
    if(canceled == "1"){
        if(cards.length < limit){
            searchArgs.innerTypeId = innerTypeId;
            searchArgs.userId = userId;
            searchArgs.page=start;
            searchArgs.effectedEnd= now.getTime();
            if(cards.length > 0){
                limit = limit - cards.length;
                searchArgs.page_size = limit;
                ecardList = CardService.searchCards(searchArgs);
                cards = cards.push.apply(cards,ecardList.cards);
            }else{
                searchArgs.page_size = limit;
                ecardList = CardService.searchCards(searchArgs);
                cards = ecardList.cards;
            }
            total = ecardList.total+total
        }
    }
    for (var i = 0; i < cards.length; i++){
        var cardObj = CardService.getCardByNumber("cardType_coupons",cardList.cards[i].cardNumber);
        if(cardObj){
            var data = {
                cardBatchId:"",
                effectedEnd:"",
                amount:"",
                outerName:"",
                ruleRemarkDes:""
            };
            data.cardBatchId = cardObj.cardBatchId;
            data.effectedEnd = DateUtil.getStringDate(cardObj.effectedEnd,"yyyy-MM-dd");
            data.amount = cardObj.amount;
            data.outerName = CardService.getCard(cardObj.cardBatchId).outerName;
            data.description = CardService.getCard(cardObj.cardBatchId).ruleRemarkDes;
            voucherList.push(data);
        }
    }

    var data1 = {
        voucherList:voucherList,
        total:total,
        limit:limit,
        start:start
    };
    //if(voucherList != []) {
    //    ret.data = data1;
    //}else{
    //    ret = ErrorCode.voucher.E1B13001;//获取失败
    //}
    out.print(JSON.stringify(data1));
})();