//#import doT.min.js
//#import pigeon.js
//#import Util.js
//#import login.js
//#import sku.js
//#import jobs.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx

(function(){
    var ret = {
        state: 'err'
    };
    var loginUserId = LoginService.getBackEndLoginUserId();
    if(!loginUserId || loginUserId == ""){
        ret.msg = "请先登录后再操作。";
        out.print(JSON.stringify(ret));
        return;
    }
    var skuId = $.params["skuId"];
    var realAmount = $.params["realAmount"];
    var zeroSellableCount = $.params["zeroSellableCount"];
    var merchantId = $.params["merchantId"];
    var isSend = $.params["isSend"];
    if(!merchantId){
        ret.msg = "merchantId参数错误。";
        out.print(JSON.stringify(ret));
        return;
    }
    if(!skuId){
        ret.msg = "skuId参数错误。";
        out.print(JSON.stringify(ret));
        return;
    }
    if(!realAmount && !zeroSellableCount){
        ret.msg = "实际库存与零负可卖数不能同时为空。";
        out.print(JSON.stringify(ret));
        return;
    }
    var productId = SkuService.getProductIdBySkuId(skuId);
    var defaultShipNode = OmsControlArgService.getDefaultShipNode(merchantId);
    if(realAmount){
        //SkuService.updateSkuQuantity(skuId,defaultShipNode,realAmount);
        //保存到数据库，如果发生变化就加入到对接队列里
        OmsEsbProductService.updateSkuRealAmount(merchantId, productId, skuId, realAmount);
    }
    if(zeroSellableCount){
        //SkuService.updateSkuQuantity(skuId,"zeroSellableCount",zeroSellableCount);
        OmsEsbProductService.updateSkuRealAmount(merchantId, productId, skuId, zeroSellableCount,"zeroSellableCount");
    }
    if(isSend && isSend == "true"){
        var jobPageId = "task/doSendOnSkuQuantityToOMS.jsx";
        var when = (new Date()).getTime() + 5*1000;
        var postData = {
            productId: productId,
            merchantId: merchantId
        };
        JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);
    }
    ret.state = "ok";
    out.print(JSON.stringify(ret));
})();