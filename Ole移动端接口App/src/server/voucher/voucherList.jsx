//#import Util.js
//#import user.js
//#import login.js
//#import card.js
//#import file.js
//#import DateUtil.js
//#import cardBatch.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
(function () {
    var ret =  ErrorCode.S0A00000;
    var userId = $.params["loginId"];
    if(!userId){
        userId = LoginService.getFrontendUserId();
    }
    var start = Number($.params["start"]) || 1;
    var limit = Number($.params["limit"]) || 10;
    if (!userId) {
        ret = ErrorCode.article.E1B04009;//当前用户没登录
        out.print(JSON.stringify(ret));
        return
    }
    var searchArgs = {};
    var voucherList = [];
    var innerTypeId = "cardType_coupons";
    var canceled = $.params["canceled"] || "0";
    var fields= "cardNumber,amount,effectedEnd,cardBatchId,canceled,activated,cardchannel";
    var now = new Date();
    var time = now.getTime();
    if(canceled == "0" || canceled == "1"){
        searchArgs.canceled=canceled;
    }else if(canceled == "2"){
        //这里是为了搜索未使用已过期的券
        searchArgs.canceled="0";
        searchArgs.effectedEnd_stop= DateUtil.getLongDate(time);
    }
    searchArgs.innerTypeId = innerTypeId;
    searchArgs.userId = userId;
    searchArgs.fields = fields;
    searchArgs.page=1;
    searchArgs.page_size= 999;
    var cardList = CardService.searchCards(searchArgs);
    var cards = cardList.cards;

    var ecardList = {};
    //已使用的券
    if(canceled == "1"){
        if(cards.length < limit){
            searchArgs.innerTypeId = innerTypeId;
            searchArgs.userId = userId;
            searchArgs.page=1;
            searchArgs.canceled = "0";
            searchArgs.page_size = 300;
            searchArgs.effectedEnd_stop = DateUtil.getLongDate(now.getTime());
            var limit1 = limit;
            if(cards.length > 0){
                limit1 = limit - cards.length;
                ecardList = CardService.searchCards(searchArgs);
            }else{
                searchArgs.page_size = limit;
                ecardList = CardService.searchCards(searchArgs);
            }
            for(var b = 0; b < limit1; b++){
                if(ecardList.cards[b]){
                ecardList.cards[b].canceled = "2";
                cards.push(ecardList.cards[b]);
                }
            }
        }
    }
    var unuser = [];
    for(var i = 0; i < cards.length; i++){
        var cardObj1 = CardBatchService.getCardBatchById(cards[i].cardBatchId);
        cards[i].ruleRemarkDes = cardObj1.ruleRemarkDes || "";
        cards[i].outerName = cardObj1.outerName || "";
        cards[i].desc = cardObj1.desc || "";
        cards[i].imgUrl = "";
        if(cardObj1.fileId){
            cards[i].imgUrl = FileService.getFullPath(cardObj1.fileId) || "";
        }
        if(canceled == "0"){
            if(DateUtil.getLongTimeByFormat(cards[i].effectedEnd,"yyyy-MM-dd HH:mm:ss") > time){
                unuser.push(cards[i]);
            }
        }
    }
    var tcards;
    var unuser1 = [];
    var begin  = (start - 1)*limit;
    var realArr = [];
    if(canceled == "0"){
        for(var a = 0; a < unuser.length; a++){
            if(unuser[a] && unuser[a].cardchannel && unuser[a].cardchannel == "ole"){
                realArr.push(unuser[a]);
            }
        }
    }
    if(canceled == "1" || canceled == "2"){
        for(var g = 0; g < cards.length; g++){
            if(cards[g] && cards[g].cardchannel && cards[g].cardchannel == "ole"){
                realArr.push(cards[g]);
            }
        }
    }

    for(var u = begin; u < (start*limit); u++){
        if(realArr[u]){
            unuser1.push(realArr[u]);
        }
    }
    tcards = unuser1;
    var data1 = {
        voucherList:tcards,
        total:realArr.length,
        limit:unuser1.length,
        start:start
    };
    if(voucherList != []) {
        ret.data = data1;
    }else{
        ret = ErrorCode.voucher.E1B13001;//获取失败
    }
    out.print(JSON.stringify(ret));
})();