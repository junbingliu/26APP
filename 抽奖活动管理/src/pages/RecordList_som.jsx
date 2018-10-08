//#import Util.js
//#import doT.min.js
//#import $lotteryEventManage:services/PrizeSettingSomService.jsx
//#import $lotteryEventManage:services/LotteryEventManageService.jsx
//#import pigeon.js
//#import cardBatch.js
//#import @oleH5Api:server/util/CartUtil.jsx
(function () {

    var merchantId = $.params["m"];
    var id = $.params["id"];

    var pageData = {
        merchantId: merchantId,

        id: id,
    };
    var result = PrizeSettingSomService.getAllList(0, -1);
    var list = [];
    for (var i = 0; i < result.length; i++) {
        if(result[i]){
            list.push({id: result[i].activityTypeId, name: result[i].activityTypeName});
        }
    }

    var lottery = LotteryEventManageService.getAllList(0, -1);
    var lost = [];
    for (var i = 0; i < lottery.length; i++) {
        if(lottery[i]){
            lost.push({id: lottery[i].id, name: lottery[i].eventName});
        }
    }

    var cpsList=[];
    var jParam = {
        merchantId:CartUtil.getOleMerchantId(),
        channel:"ole"//搜索cps券
    };
    var cpsResult = CardBatchService.searchCardBatch(jParam);
    var resultCps =cpsResult.list;
    for (var i=0;i<resultCps.length;i++){
        if (resultCps[i]){
            cpsList.push({id:resultCps[i].id,name:resultCps[i].outerName})
        }
    }

    var vipList=[];
    jParam.channel = "online";//搜索vip券
    var vipResult = CardBatchService.searchCardBatch(jParam);
    var resultVip =vipResult.list;
    for (var i=0;i<resultVip.length;i++){
        if (resultVip[i]){
            cpsList.push({id:resultVip[i].id,name:resultVip[i].outerName})
        }
    }
    pageData.list = list;
    pageData.lost = lost;
    pageData.cpsList=cpsList;
    pageData.vipList=vipList;
    var template = $.getProgram(appMd5, "pages/RecordList_som.jsxp");
    var pageFn = doT.template(template);
    out.print(pageFn(pageData));
})();

