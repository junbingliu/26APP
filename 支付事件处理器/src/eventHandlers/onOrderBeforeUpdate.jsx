//#import Util.js
//#import order.js
//#import payment.js
//#import realPayRec.js
//#import login.js
//#import @utils/orderDistributeUtil.jsx
$.log("onBeforeOrderUpdate.................\n");
var jOrder = ctx.get("order"); //JSONObject
var itemPrices = [];
var payRecPrices = [];

//首先将items按从小到大进行排序
var items = jOrder.getJSONObject("items");
var names = $.getNames(items);
for(var i=0; i<names.length; i++){
    var itemId =  names[i];
    var item = items.getJSONObject(itemId);
    var priceInfo = item.getJSONObject("priceInfo");
    var price = priceInfo.getString("fTotalPrice");
    var itemPrice = {id:"" + itemId , price:Number(price)};
    itemPrices.push(itemPrice);
}
itemPrices.sort(function(a,b){ return a.price - b.price;});
$.log(JSON.stringify(itemPrices));

var payRecs = jOrder.getJSONObject("payRecs");
var payRecIds = $.getNames(payRecs);
for(var i=0; i<payRecIds.length; i++){
    var payRecId =  payRecIds[i];
    var payRec = payRecs.getJSONObject(payRecId);
    var price = payRec.getString("fMoneyAmount");
    var payInterfaceId = "" + payRec.getString("payInterfaceId");
    var payRecPrice = {id:"" + payRecId ,payInterfaceId:payInterfaceId, price:Number(price)};
    payRecPrices.push(payRecPrice);
}
payRecPrices.sort(function(a,b){return a.price - b.price;});

var itemPriceN = itemPrices.map(function(itemPrice){return itemPrice.price;});
var payRecPriceN = payRecPrices.map(function(payRecPrice){return payRecPrice.price;});
var result = OrderDistributeUtil.distribute(itemPriceN,payRecPriceN);
//根据payInterfaceId进行汇总
for(var i=0; i<result.length; i++){
    var itemPayRecsResult = result[i];
    var itemPayRecsObject = {}; //最终放入order对象里面的对象
    for(var j=0; j<itemPayRecsResult.length;j++){
        var payRecPrice = payRecPrices[j];
        var fItemPayRec = itemPayRecsObject[payRecPrice.payInterfaceId];
        if(!fItemPayRec){
            itemPayRecsObject[payRecPrice.payInterfaceId] = itemPayRecsResult[j];
        }
        else{
            itemPayRecsObject[payRecPrice.payInterfaceId]+=itemPayRecsResult[j];
        }
    }
    var itemPrice = itemPrices[i];
    var jItem = items.getJSONObject(itemPrice.id);
    jItem.put("payRecs",itemPayRecsObject);
}



