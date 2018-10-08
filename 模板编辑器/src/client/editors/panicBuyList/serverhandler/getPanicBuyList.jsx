//#import Util.js
//#import panicBuy.js
//#import product.js
//#import file.js
//#import DateUtil.js

//抢购列表
var m = $.params.m||"head_merchant";
var offset=$.params.offset||0;
var count=$.params.count||8;
var state=$.params.state;
var keyword=$.params.keyword;
var type="col_m_Promotional_001";
if(state=="future"){
    //获取未开始团购
    var ret = PanicBuyService.getFuturePanicBuys(m,type,Number(offset),Number(count));
}else if(state=="expired"){
    //获取往期
    var ret = PanicBuyService.getExpiredPanicBuys(m,type,Number(offset),Number(count));
}else if(state=="current"){
    //获取正在进行
    var ret = PanicBuyService.getCurrentPanicBuys(m,type,Number(offset),Number(count));
}else if(state=="search"){
    var ret = PanicBuyService.search(m,keyword,type,Number(offset),Number(count));
}else if(state=="today"){
    var ret = PanicBuyService.getTodayData(m,type,Number(offset),Number(count));
}else if(state=="unStart") {
    ret = PanicBuyService.getTomorrowData(m,type,Number(offset),Number(count));
    if(ret.total==0){
        ret = PanicBuyService.getAfterTodayData(m,type,Number(offset),Number(count));
    }
}else if(state=="over"){
    ret = PanicBuyService.getExpiredPanicBuys(m,type,Number(offset),Number(count));
}
else if(state=="yesterday"){
    var ret = PanicBuyService.getYesTodayPanicBuys(m,type,Number(offset),Number(count));
}else{
    var ret = PanicBuyService.getAllPanicBuys(m,type,Number(offset),Number(count));
}

var panicBuyList=ret.products;
if(!panicBuyList){
    out.print(JSON.stringify(ret));
}
var productIds = [];
for (var i = 0; i < panicBuyList.length; i++) {
    productIds.push(panicBuyList[i].productId);
}
var products = ProductService.getProducts(productIds,"100X100");
for (var i = 0; i < panicBuyList.length; i++) {
    var jProdcut = products[i];
    if(!jProdcut){
        continue;
    }

    var logo = jProdcut.logo;
    panicBuyList[i]["imgUrl"] = logo||"/upload/nopic_100.gif";
    var marketPrice = ProductService.getMarketPrice(jProdcut);
    if(marketPrice){
        panicBuyList[i]["marketPrice"]=marketPrice*100;
    }else{
        panicBuyList[i]["marketPrice"]='暂无价格';
    }
    var date=panicBuyList[i].buyTime.split("-");
    panicBuyList[i]["startDate"]=date[0];
    panicBuyList[i]["endDate"]=date[1];
    var startDate=DateUtil.getShortDate(date[0]);
    var endDate=DateUtil.getShortDate(date[1]);
    var buyTime=startDate+"至"+endDate;
    panicBuyList[i]["buyTime"]=buyTime;
    if(!panicBuyList[i].recommend){
        panicBuyList[i].recommend=false;
    }

}

out.print(JSON.stringify(ret));