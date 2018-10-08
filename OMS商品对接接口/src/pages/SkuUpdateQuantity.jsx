//#import Util.js
//#import open.js
//#import soap.js
//#import esb.js
//#import sku.js
//#import inventory.js
//#import code2merchant.js

(function () {

    response.setContentType("text/xml;charset=utf-8");

    var returnCode = "";
    var returnDesc = "";
    var soapResponse;
    try {
        var soapRequest = SoapService.soapJsonRequest(request);//接受soap格式报文，并转换成JSON格式
        if (!soapRequest || soapRequest == "") {
            returnCode = "S000AM01";
            returnDesc = "错误的报文格式";
            soapResponse = EsbService.getResponseXml(returnCode, returnDesc, "");//以soap报文格式返回
            out.print(soapResponse);
            return;
        }
        var jRequestData = EsbService.getEsbRequestDataJSON(soapRequest);//直接获取xml格式中的REQUEST_DATA属性，并转换成JSON
        if (!jRequestData) {
            returnCode = "S000AM04";
            returnDesc = "REQUEST_DATA数据异常";
            soapResponse = EsbService.getResponseXml(returnCode, returnDesc, "");//以soap报文格式返回
            out.print(soapResponse);
            return;
        }

        var skus = jRequestData.skus;
        if (!skus || skus.length == 0) {
            returnCode = "S000AM04";
            returnDesc = "skus参数为空或者skus不存在数据";
            soapResponse = EsbService.getResponseXml(returnCode, returnDesc, "");//以soap报文格式返回
            out.print(soapResponse);
            return;
        }

        var totalFailed = 0;
        var totalSuccess = 0;
        var errorInfo = [];
        for (var i = 0; i < skus.length; i++) {
            var jSku = skus[i];

            var inventorytype = jSku.inventorytype;//库存类型(0在库)
            var inventoryqty = jSku.inventoryqty;//库存数量
            var organizationCode = jSku.organizationcode;
            if (!organizationCode || organizationCode == "") {
                totalFailed++;
                errorInfo.push({"msg": "skuId为【" + jSku.skuid + "】必要的organizationcode为空"});
                continue;
            }

            var merchantId = getMerchantIdByCode(organizationCode);
            if (!merchantId || merchantId == "") {
                totalFailed++;
                errorInfo.push({"msg": "organizationcode为【" + organizationCode + "】对应的商家不存在或者未配置"});
                continue;
            }

            var jSkuInfo = {};
            jSkuInfo.outerId = jSku.skuid;
            jSkuInfo.merchantId = merchantId;
            jSkuInfo.sellableCount = parseInt(jSku.inventoryqty);

            jSkuInfo.sellableCount = jSkuInfo.sellableCount + getFreezeAmount(merchantId, jSku.skuid);//加上冻结库存

            var updateResult = OpenService.updateSkuSellableCount(jSkuInfo);
            if (updateResult.code == "0") {
                totalSuccess++;
            } else {
                totalFailed++;
                updateResult.merchantId = merchantId;
                errorInfo.push(updateResult);
            }
        }

        var batchResult = {};
        batchResult.code = "0";
        batchResult.msg = "批量修改SKU库存执行完毕，请查看errorResult中对应的对接异常返回结果";
        batchResult.errorResult = errorInfo;
        batchResult.total_success = totalSuccess;
        batchResult.total_failed = totalFailed;

        if (batchResult.total_failed > 0) {
            returnCode = "S000AZ09";
            returnDesc = "部分或者全部数据对接出现异常，详细可查看return_data的对应返回";
        } else {
            returnCode = "S000A000";
            returnDesc = "操作成功";
        }
        soapResponse = EsbService.getResponseXml(returnCode, returnDesc, JSON.stringify(batchResult));
        out.print(soapResponse);
    } catch (e) {
        returnCode = "S000AM04";
        returnDesc = "操作出现异常，异常信息为：" + e;
        soapResponse = EsbService.getResponseXml(returnCode, returnDesc, "");
        out.print(soapResponse);
    }

})();

function getFreezeAmount(merchantId, realSkuId) {
    if (!merchantId || !realSkuId) {
        return 0;
    }
    var productId = SkuService.getProductIdByRealSkuId(merchantId, realSkuId);
    if(!productId){
        return 0;
    }

    var jSku = SkuService.getSkuByRealSkuIdEx(productId, realSkuId);
    if(!jSku){
        return 0;
    }
    var skuId = jSku.id;
    return InventoryService.getSkuFreezeAmount(productId, skuId);

}
function getMerchantIdByCode(organizationCode) {
    return Code2MerchantService.getMerchantIdByMerchantCode(organizationCode);
}
