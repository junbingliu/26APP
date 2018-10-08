//#import pigeon.js
//#import product.js
//#import sku.js
//#import soap.js
//#import esb.js
//#import $OmsEsbOrder:services/OmsESBUtil.jsx

var OmsEsbProductSkuService = (function (pigeon) {
    var prefix_obj = "omsEsbProductObj";
    var prefix_list = "omsEsbProductList";

    var f = {
        /**
         * 根据skuId和organizationCode获得OMS的可销售库存
         * @param skuId
         * @param organizationCode
         * @returns {{}}
         */
        getSkuSellAbleCount: function (skuId, organizationCode) {
            var jResult = {};
            try {
                var jParams = {};
                jParams.skuid = skuId;
                jParams.organizationcode = organizationCode;
                var requestData = JSON.stringify(jParams);

                var serviceId = "2E150000000054";
                var sn = EsbService.getSerialNumber();
                var mac = "";
                var xmlData = EsbService.getRequestXml(sn, mac, serviceId, requestData);
                //$.log("............................OMS...xmlData=" + xmlData);
                var jResultEOMS = EsbService.soapPostToESB(xmlData);

                if (!jResultEOMS) {
                    jResult.code = "101";
                    jResult.msg = "调用接口返回数据格式异常";
                    return jResult;
                }
                var esbResponse = EsbService.getEsbResponse(jResultEOMS);
                if (!esbResponse) {
                    jResult.code = "102";
                    jResult.msg = "RESPONSE数据返回格式异常";
                    return jResult;
                }
                var returnCode = esbResponse.RETURN_CODE;
                if (returnCode == "S000A000") {
                    jResult.code = "0";
                    jResult.skuId = esbResponse.skuid;
                    jResult.sellAbleCount = esbResponse.inventoryqty;
                    jResult.msg = "查看可销售库存成功";
                    return jResult;
                }

                jResult.code = "110";
                jResult.msg = "库存查询失败，失败原因:" + JSON.stringify(esbResponse);
                return jResult;
            } catch (e) {
                jResult.code = "99";
                jResult.msg = "库存查询出现异常，异常信息为:" + e;
                return jResult;
            }
        },
        sendSkuInventoryQtyToOMS: function (skus) {
            var jResult = {};
            try {
                var jParams = {};
                jParams.skus = skus;
                var requestData = JSON.stringify(jParams);

                var serviceId = "2E150000000005";
                var sn = EsbService.getSerialNumber();
                var omsEsb_url = EsbUtilService.getOMSEsbUrl();//获取OMS对接地址
                var mac = "";
                var xmlData = EsbService.getRequestXml(sn, mac, serviceId, requestData);
                //$.log("............................OMS...xmlData=" + xmlData);
                var jResultEOMS = EsbService.soapPost(xmlData);

                if (!jResultEOMS) {
                    jResult.code = "101";
                    jResult.msg = "调用接口返回数据格式异常";
                    return jResult;
                }
                var esbResponse = EsbService.getEsbResponse(jResultEOMS);
                if (!esbResponse) {
                    jResult.code = "102";
                    jResult.msg = "RESPONSE数据返回格式异常";
                    return jResult;
                }
                var returnCode = esbResponse.RETURN_CODE;
                if (returnCode == "S000A000") {
                    jResult.code = "0";
                    jResult.skuId = esbResponse.skuid;
                    jResult.sellAbleCount = esbResponse.inventoryqty;
                    jResult.msg = "查看可销售库存成功";
                    return jResult;
                }

                jResult.code = "110";
                jResult.msg = "库存查询失败，失败原因:" + JSON.stringify(esbResponse);
                return jResult;
            } catch (e) {
                jResult.code = "99";
                jResult.msg = "库存查询出现异常，异常信息为:" + e;
                return jResult;
            }
        }
    };
    return f;
})($S);