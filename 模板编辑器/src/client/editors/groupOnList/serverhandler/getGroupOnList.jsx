//#import Util.js
//#import product.js
//#import panicBuy.js
//#import file.js
//#import DateUtil.js


var m = $.params.m||"head_merchant";
var offset=$.params.offset||0;
var count=$.params.count||8;
var state=$.params.state;
var keyword=$.params.keyword;
var type="col_m_Promotional_002";
//获取团购列表
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
}
else if(state=="today"){
    var ret = PanicBuyService.getTodayData(m,type,Number(offset),Number(count));
}
else if(state=="unStart") {
    ret = PanicBuyService.getTomorrowData(m,type,Number(offset),Number(count));
    if(ret.total==0){
        ret = PanicBuyService.getAfterTodayData(m,type,Number(offset),Number(count));
    }
}else if(state=="over"){
    ret = PanicBuyService.getExpiredPanicBuys(m,type,Number(offset),Number(count));
}
else if(state=="yesterday"){
    var ret = PanicBuyService.getYesTodayPanicBuys(m,type,Number(offset),Number(count));
}
else{
    var ret = PanicBuyService.getAllPanicBuys(m,type,Number(offset),Number(count));
}
var groupOnList=ret.products;
if(!groupOnList){
    out.print(JSON.stringify(ret));
}
var productIds = [];
for (var i = 0; i < groupOnList.length; i++) {
    productIds.push(groupOnList[i].productId);
}
var products = ProductService.getProducts(productIds,"100X100");
for (var i = 0; i < groupOnList.length; i++) {
    var jProdcut = products[i];
    if(!jProdcut){
        continue;
    }
    var logo = jProdcut.logo;
    groupOnList[i]["imgUrl"] = logo||"/upload/nopic_100.gif";
    var price = groupOnList[i]["price"];
    if(price){
        groupOnList[i]["price"] = price;
    }else{
        groupOnList[i]["price"] ='暂无价格';
    }

    var marketPrice = ProductService.getMarketPrice(jProdcut);
    if(marketPrice){
        groupOnList[i]["marketPrice"]=marketPrice*100;
    }else{
        groupOnList[i]["marketPrice"]='暂无价格';
    }
    var date=groupOnList[i].buyTime.split("-");
    groupOnList[i]["startDate"]=date[0];
    groupOnList[i]["endDate"]=date[1];
    var startDate=DateUtil.getShortDate(date[0]);
    var endDate=DateUtil.getShortDate(date[1]);
    var buyTime=startDate+"至"+endDate;
    groupOnList[i]["buyTime"]=buyTime;
    if(!groupOnList[i].recommend){
        groupOnList[i].recommend=false;
    }
    //卖点
    groupOnList[i]["sellingPoint"]=jProdcut.sellingPoint||"";

}

out.print(JSON.stringify(ret));