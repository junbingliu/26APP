//#import Util.js
//#import soap.js
//#import esb.js
//#import sku.js
//#import jobs.js
//#import product.js
//#import ProductUtil.js
//#import DateUtil.js
//#import inventory.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
//#import $OmsEsbOrder:services/OmsESBUtil.jsx
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx
;
(function () {

    if (!merchantId || merchantId == "") {
        return;
    }
    merchantId = merchantId + "";

    var needExchangeToOms = OmsControlArgService.needExchangeToOms(merchantId);
    if (!needExchangeToOms) {
        $.log("商家" + merchantId + "没有启用OMS对接，不需要对接库存");
        return;
    }

    var logType = "omsEsb_SkuQuantity";
    var serviceId = "2E150000000005";
    var columnId = "c_10000";
    var productList = ProductService.getProductsOfColumn(columnId, merchantId, 0, -1);//todo:分页获取对接
    if (productList.length == 0) {
        add2Task(merchantId);
        return;
    }

    var skuList = [];
    for (var k = 0; k < productList.length; k++) {
        var jProduct = productList[k];
        if (!jProduct) {
            continue;
        }
        var productId = jProduct.objId;

        var jSku;
        var skus = ProductService.getSkus(productId);
        if (skus.length == 0) {
            continue;
        }

        var formatCurTime = DateUtil.getLongDate(new Date().getTime());
        if (skus.length > 1) {
            for (var i = 0; i < skus.length; i++) {
                jSku = skus[i];
                if (jSku.isHead) {
                    //continue;
                }

                skuList = getSmallSku(skuList, jSku, formatCurTime, merchantId);
            }
        } else {
            jSku = skus[0];
            skuList = getSmallSku(skuList, jSku, formatCurTime, merchantId);
        }

        if (skuList.length >= 300) {
            doSendToOMS(logType, serviceId, merchantId, skuList);
            skuList = [];
        }
    }

    if (skuList.length > 0) {
        doSendToOMS(logType, serviceId, merchantId, skuList);
    }
    add2Task(merchantId);
})();
function add2Task(merchantId) {
    var jobPageId = "task/doSendO2OSkuQuantityToOMS.jsx";
    var when = getNextExecTime();//每5分钟执行一次
    var postData = {
        merchantId: merchantId
    };
    var taskId = JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when) + "";
    OmsEsbProductService.saveTaskId(merchantId, taskId);
}
function getNextExecTime() {
    var nowTime = DateUtil.getNowTime();//当前时间
    //每5分钟执行一次
    return parseInt(nowTime) + 5 * 60 * 1000;
}

function doSendToOMS(logType, serviceId, merchantId, skuList) {
    var logContent = "";
    var sn = EsbService.getSerialNumber();
    var mac = "";
    var requestData = {
        skus: skuList
    };
    requestData = JSON.stringify(requestData);
    var omsEsb_url = EsbUtilService.getOMSEsbUrl();//获取OMS对接地址
    var xmlData = EsbService.getRequestXml(sn, mac, serviceId, requestData);
    //$.log("............................xmlData=" + xmlData);

    var jResult = EsbService.soapPost(omsEsb_url, xmlData);
    if (!jResult) {
        logContent = "merchantId[【" + merchantId + "】SKU实际库存对接失败，失败原因：数据返回格式异常";
        OmsEsbLogService.addLog(logType, "", serviceId, sn, logContent);
        return;
    }

    var jEsbResponse = EsbService.getEsbResponse(jResult);
    if (!jEsbResponse) {
        logContent = "merchantId[【" + merchantId + "】SKU实际库存对接失败，失败原因：RESPONSE数据返回格式异常";
        OmsEsbLogService.addLog(logType, "", serviceId, sn, logContent);
        return;
    }
    var returnCode = jEsbResponse.RETURN_CODE;
    var returnDesc = jEsbResponse.RETURN_DESC;
    var returnData = jEsbResponse.RETURN_DATA;
    if (returnCode == "S000A000") {
        //对接成功，什么都不做
        //logContent = "merchantId【" + merchantId + "】SKU实际库存对接失败，返回代码：" + JSON.stringify(jEsbResponse);
        //OmsEsbLogService.addLog(logType, productId, serviceId, sn, logContent);
        return;
    }

    logContent = "merchantId【" + merchantId + "】SKU实际库存对接失败，失败原因：" + JSON.stringify(jEsbResponse);
    OmsEsbLogService.addLog(logType, "", serviceId, sn, logContent);
}

function getZeroSellCount(skuList, jSku, productId, defaultShipNode, time) {
    if (!jSku || !productId || !skuList) {
        return skuList;
    }
    var zeroSellable = jSku.zeroSellable;
    //如果不支持零负可卖，那就不对接
    if (zeroSellable == "0" || !zeroSellable) {
        return skuList;
    }
    var zeroSellCount = InventoryService.getSkuZeroSellCount(productId, jSku.id);
    var jSkuInfo = {};
    jSkuInfo.skuid = jSku.skuId;
    jSkuInfo.node = defaultShipNode;
    jSkuInfo.inventorytype = "1";
    jSkuInfo.inventoryqty = zeroSellCount;
    jSkuInfo.operatetime = time;
    skuList.push(jSkuInfo);
    return skuList;
}

function getSmallSku(skuList, jSku, operatetime, merchantId) {
    var skuId = jSku.id;
    var realSkuId = jSku.skuId;

    var defaultShipNode = OmsControlArgService.getDefaultShipNode(merchantId);
    var jSkuQuantities = SkuService.getSkuAllQuantity(skuId);
    if (jSkuQuantities) {
        var jValues = jSkuQuantities.values;
        if (jValues) {
            for (var skuStoreCode in jValues) {
                if(skuStoreCode != defaultShipNode){
                    continue;
                }
                var inventoryqty = jValues[skuStoreCode];

                var jSkuInfo = {};
                jSkuInfo.skuid = realSkuId;
                jSkuInfo.node = skuStoreCode;
                jSkuInfo.inventorytype = "0";
                jSkuInfo.inventoryqty = inventoryqty;
                jSkuInfo.operatetime = operatetime;
                //零负可卖数量
                if (skuStoreCode == "zeroSellableCount") {
                    jSkuInfo.node = defaultShipNode;
                    jSkuInfo.inventorytype = "1";
                    jSkuInfo.inventoryqty = inventoryqty;
                    skuList.push(jSkuInfo);
                    continue;
                }

                skuList.push(jSkuInfo);
            }
        }
    }
    return skuList;
}




