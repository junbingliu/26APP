//#import Util.js
//#import jobs.js
//#import sku.js
//#import DateUtil.js
//#import inventory.js
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx

(function () {
    try {
        var logType = "omsEsb_SkuQuantity";
        var serviceId = "2E150000000005";
        var defaultShipNode = OmsControlArgService.getDefaultShipNode(merchantId);
        var skus = ProductService.getSkus(productId);
        if (skus.length == 0) {
            $.log("..................商品ID:" + productId + ",没有sku,不需要对接库存给OMS");
            return;
        }

        var formatCurTime = DateUtil.getLongDate(new Date().getTime());
        var skuList = [];
        if (skus.length > 0) {
            var jSku;
            for (var i = 0; i < skus.length; i++) {
                jSku = skus[i];
                if (jSku.isHead && skus.length > 1) {
                    //continue;
                }

                skuList = getSmallSku(skuList, jSku, formatCurTime,merchantId);
            }
        } else {
            jSku = skus[0];
            skuList = getSmallSku(skuList, jSku, formatCurTime,merchantId);
        }
        doSendToOMS(logType, serviceId, merchantId, skuList);
    } catch (e) {
        $.log("...................doSendOnSkuQuantityToOMS.jsx..........出现异常:" + e);
    }
})();


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
        OmsEsbLogService.addLog(logType, merchantId, serviceId, sn, logContent);
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

function getSmallSku(skuList, jSku, operatetime,merchantId) {
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
                if(skuStoreCode == "zeroSellableCount"){
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