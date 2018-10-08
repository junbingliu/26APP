//#import Util.js
//#import user.js
//#import login.js
//#import card.js
//#import file.js
//#import DateUtil.js
//#import cardBatch.js
//#import sysArgument.js
//#import @server/util/ErrorCode.jsx
;(function (pigeon) {
    var selfApi = new JavaImporter(
        net.xinshi.isone.modules.IsoneModulesEngine
    );
    function setResultInfo(code, msg, data) {
        var result = {};
        result.code = code;
        result.msg = msg;
        result.data = data || {};
        out.print(JSON.stringify(result));
    }
    try{
        //var ret =  ErrorCode.S0A00000;
        var userId = $.params["loginUserId"];
        if(!userId){
            userId = LoginService.getFrontendUserId();
        }
        var start = Number($.params["start"]) || 1;
        var limit = Number($.params["limit"]) || 999;
        if (!userId) {
            ret = ErrorCode.article.E1B04009;//当前用户没登录
            out.print(JSON.stringify(ret));
            return
        }
        var searchArgs = {};
        var voucherList = [];
        var innerTypeId = "cardType_coupons";
        var canceled = $.params["canceled"] || "0";
        var fields= "cardNumber,amount,effectedEnd,cardBatchId,canceled,activated,cardchannel,cardTypeId";
        var now = new Date();
        var time = now.getTime();
        //if(canceled == "0" || canceled == "1"){
           searchArgs.canceled=0;
        //}
        searchArgs.innerTypeId = innerTypeId;
        searchArgs.userId = userId;
        searchArgs.fields = fields;
        searchArgs.cardchannel = "ole";
        searchArgs.page=1;
        searchArgs.page_size= 999;
        var cardList = CardService.searchCards(searchArgs);
        var cards = cardList.cards;
        var begin  = (start - 1)*limit;

        var unuser = [];
        var totalCount = 0;
        for(var i = 0; i < cards.length; i++){
            //if(cards[i] && cards[i].cardchannel && cards[i].cardchannel == "ole"){
                if(DateUtil.getLongTimeByFormat(cards[i].effectedEnd,"yyyy-MM-dd HH:mm:ss") < time ){
                    cards[i].isoverdue = 1;
                }else {
                    cards[i].isoverdue = 0;
                }
                var cardObj1 = CardBatchService.getCardBatchById(cards[i].cardBatchId);
                var cardTypeStr = selfApi.IsoneModulesEngine.cardTypeService.getCardType(cards[i].cardTypeId);
                cards[i].cardType = JSON.parse(cardTypeStr);
                cards[i].ruleRemarkDes = cardObj1.ruleRemarkDes || "";
                cards[i].outerName = cardObj1.outerName || "";
                cards[i].cardNumCode = cardObj1.cardNumCode || "";
                cards[i].desc = cardObj1.desc || "";
                cards[i].imgUrl = "";
                if(cardObj1.fileId){
                    cards[i].imgUrl = FileService.getFullPath(cardObj1.fileId) || "";
                }

                if(i < (start*limit) && i >= begin){
                    unuser.push(cards[i]);
                }
                totalCount ++;
            //}



        }


        setResultInfo("S0A00000", "success",{"voucherList":unuser,"total":totalCount,"limit":limit,"start":start});
    }catch (e){
        $.error("查询优惠卷信息失败" + e);
        setResultInfo("E1B0001333","查询优惠卷信息失败" + e);
    }

})();