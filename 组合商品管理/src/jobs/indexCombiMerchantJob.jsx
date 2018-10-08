//#import DateUtil.js
//#import search.js
//#import $combiproduct:services/ComMerchantService.jsx
var id = id;
var merchantId = merchantId;
var comMerchant =ComMerchantService.get(id);
if(comMerchant){
    var doc = {};
    doc["lastModifiedTime"] = comMerchant.lastModifiedTime;//最新添加作品的时间（或者最后修改作品的时间）
    doc["createTime"] = (new Date()).getTime();//创建时间
    doc["type"] = "combiMerchant";
    doc["merchantId"] = merchantId;//商家Id
    doc["id"] = id;
    doc["pos_f"] = comMerchant.pos;
    doc["goodsNumber"] =comMerchant.goodsNumber;
    doc["goodStyle_text"] = comMerchant.goodStyle;//擅长风格
    if(parseInt(comMerchant.goodsNumber) <=0){

        SearchService.index([null],[id],"combiMerchant");
    }else{
        //$.log("=====     save    =======");
        SearchService.index([doc],[id],"combiMerchant");
    }
}
