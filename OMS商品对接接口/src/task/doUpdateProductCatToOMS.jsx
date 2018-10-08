//#import Util.js
//#import product.js
//#import column.js
//#import esb.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import $OmsEsbOrder:services/OmsESBUtil.jsx
;
(function () {

    var logContent = "";
    var logType = "omsEsb_productCategory";
    var serviceId = "2E150000000061";//SKU目录关系
    try {
        //$.log("\n............................doUpdateProductCatToOMS.jsx...begin...productId=" + productId);
        //$.log("\n............................doUpdateProductCatToOMS.jsx...begin...columnId=" + columnId);
        var jColumn = ColumnService.getColumnByState(columnId, false);
        if (!jColumn) {
            return;
        }

        var columnType = jColumn.columntype;
        if (columnType != "coltype_standardProduct") {
            //只对接商品主分类
            return;
        }

        if (!action || !(action == "Delete" || action == "Create")) {
            return;
        }

        var catSkus = getSkuList(productId, action);
        if (catSkus.length == 0) {
            return;
        }
        //$.log("\n............................doUpdateProductCatToOMS.jsx...2222222222222222...columnId=" + columnId);
        var sn = EsbService.getSerialNumber();
        var mac = "";
        var requestData = {
            categoryid: jColumn.id,
            categoryskus: catSkus
        };
        var omsEsb_url = EsbUtilService.getOMSEsbUrl();//获取OMS对接地址

        requestData = JSON.stringify(requestData);
        var xmlData = EsbService.getRequestXml(sn, mac, serviceId, requestData);
        //$.log("............................xmlData=" + xmlData);

        var jResult = EsbService.soapPost(omsEsb_url, xmlData);
        if (!jResult) {
            logContent = "商品ID为【" + productId + "】，商品分类ID为【" + columnId + "】接口对接失败，失败原因：数据返回格式异常";
            OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
            return;
        }

        var jEsbResponse = EsbService.getEsbResponse(jResult);
        if (!jEsbResponse) {
            logContent = "商品ID为【" + productId + "】，商品分类ID为【" + columnId + "】接口对接失败，失败原因：RESPONSE数据返回格式异常";
            OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
            return;
        }
        var returnCode = jEsbResponse.RETURN_CODE;
        var returnDesc = jEsbResponse.RETURN_DESC;
        var returnData = jEsbResponse.RETURN_DATA;
        if (returnCode == "S000A000") {
            //对接成功，什么都不做
            //logContent = "商品ID为【" + productId + "】接口对接成功，返回代码：" + JSON.stringify(jEsbResponse);
            //OmsEsbLogService.addLog(logType, productId, serviceId, sn, logContent);
            return;
        }

        logContent = "商品ID为【" + productId + "】，商品分类ID为【" + columnId + "】接口对接失败，失败原因：" + JSON.stringify(jEsbResponse);
        OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
    } catch (e) {
        logContent = "商品ID为【" + productId + "】，商品分类ID为【" + columnId + "】接口对接失败，失败原因：" + e;
        OmsEsbLogService.addLog(logType, columnId, serviceId, sn, logContent);
    }

})();

function getSkuList(productId, action) {
    var jSkuInfo;
    var jSku;
    var skuList = [];
    var skus = ProductService.getSkus(productId);
    if (skus.length == 0) {
        return skuList;
    }

    if (skus.length > 1) {
        for (var i = 0; i < skus.length; i++) {
            jSku = skus[i];
            if (jSku.isHead) {
                continue;
            }

            jSkuInfo = getSmallSku(jSku, action);
            skuList.push(jSkuInfo);
        }
    } else {
        jSku = skus[0];
        jSkuInfo = getSmallSku(jSku, action);
        skuList.push(jSkuInfo);
    }

    return skuList;
}

function getSmallSku(jSku, action) {
    var jSkuInfo = {};
    jSkuInfo.skuid = jSku.skuId;
    jSkuInfo.action = action;

    return jSkuInfo;
}
