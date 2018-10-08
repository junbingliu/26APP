//#import pigeon.js
//#import jobs.js
//#import product.js
//#import sku.js
//#import soap.js
//#import esb.js
//#import $OmsEsbControlCenter:services/OmsEsbLogService.jsx
//#import $OmsEsbOrder:services/OmsESBUtil.jsx
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
//#import $inventoryManage:services/InventoryManageService.jsx

var OmsEsbProductService = (function (pigeon) {
    var prefix_obj = "omsEsbProductObj";
    var prefix_list = "omsEsbProductList_";

    var f = {
        getErpPrice: function (merchantId, realSkuId) {
            var productId = SkuService.getProductIdByRealSkuId(merchantId, realSkuId);
            if (!productId) {
                return "";
            }
            var jProduct = ProductService.getProduct(productId);
            if (!jProduct) {
                return "";
            }

            var jPrice = jProduct.price;
            if (!jPrice) {
                return "";
            }

            var jValues = jPrice.values;
            if (!jValues) {
                return "";
            }

            var skus = SkuService.getProductSkuList(productId);
            var jSku = SkuService.getSkuByRealSkuId(skus, realSkuId);
            var jHeadSku = SkuService.getHeadSku(skus);
            var matchPrice = f.getMatchPrice(jValues, jSku.id, "entity_erpPrice");
            if (!matchPrice) {
                matchPrice = f.getMatchPrice(jValues, jHeadSku.id, "entity_erpPrice");
            }
            if (matchPrice) {
                return matchPrice.unitPrice / 100;
            }
            return "";
        },
        isExistMallPrice: function (merchantId, realSkuId) {
            var productId = SkuService.getProductIdByRealSkuId(merchantId, realSkuId);
            if (!productId) {
                return false;
            }
            var jProduct = ProductService.getProduct(productId);
            if (!jProduct) {
                return false;
            }

            var jPrice = jProduct.price;
            if (!jPrice) {
                return false;
            }

            var jValues = jPrice.values;
            if (!jValues) {
                return false;
            }

            var skus = SkuService.getProductSkuList(productId);
            var jSku = SkuService.getSkuByRealSkuId(skus, realSkuId);
            var jHeadSku = SkuService.getHeadSku(skus);
            var matchPrice = f.getMatchPrice(jValues, jSku.id, "entity_mallPrice");
            if (!matchPrice) {
                matchPrice = f.getMatchPrice(jValues, jHeadSku.id, "entity_mallPrice");
            }
            if (matchPrice) {
                return true;
            }
            return false;
        },

        getMatchPrice: function (jValues, skuId, entity) {
            for (var k in jValues) {
                if (k != skuId) {
                    continue;
                }
                var skuValues = jValues[k];
                var key = ProductService.getPriceValueKey("entitytype_other", entity);
                var prices = skuValues[key];
                if (prices && prices.length > 0) {
                    return prices[0];
                }
            }
            return null;
        },

        isAnomalous: function (jProduct) {
            //长宽高超过：60*37*45cm 算异形
            try {
                var lengthNum = 0;
                var wideNum = 0;
                var highNum = 0;
                if (jProduct.length) {
                    lengthNum = parseFloat(jProduct.length);
                }
                if (jProduct.wide) {
                    wideNum = parseFloat(jProduct.wide);
                }
                if (jProduct.high) {
                    highNum = parseFloat(jProduct.high);
                }

                var max = f.getMax(lengthNum, wideNum, highNum);
                var min = f.getMin(lengthNum, wideNum, highNum);
                var mid = f.getMiddle(max, min, lengthNum, wideNum, highNum);

                if (max > 60 || mid > 45 || min > 37) {
                    return "1";
                }
            } catch (e) {
            }
            return "0";
        },

        getMax: function (lengthNum, wideNum, highNum) {
            var max = lengthNum;
            if (wideNum > max) {
                max = wideNum;
            }
            if (highNum > max) {
                max = highNum;
            }
            return max;
        },

        getMin: function (lengthNum, wideNum, highNum) {
            var min = lengthNum;
            if (wideNum < min) {
                min = wideNum;
            }
            if (highNum < min) {
                min = highNum;
            }
            return min;
        },

        getMiddle: function (max, min, lengthNum, wideNum, highNum) {
            if (lengthNum != max && lengthNum != min) {
                return lengthNum;
            }
            if (wideNum != max && wideNum != min) {
                return wideNum;
            }
            if (highNum != max && highNum != min) {
                return highNum;
            }
            return 0;
        },

        doSendToOMS: function (productId, data) {
            var logContent = "";
            var logType = "omsEsb_product";
            var sn = EsbService.getSerialNumber();
            var omsEsb_url = EsbUtilService.getOMSEsbUrl();//获取OMS对接地址
            var mac = "";
            var serviceId = "2E150000000001";//SKU基本资料
            var requestData = JSON.stringify(data);
            var xmlData = EsbService.getRequestXml(sn, mac, serviceId, requestData);
            //$.log("............................xmlData=" + xmlData);

            var jResult = EsbService.soapPost(omsEsb_url, xmlData);
            if (!jResult) {
                logContent = "商品ID为【" + productId + "】接口对接失败，失败原因：数据返回格式异常";
                OmsEsbLogService.addLog(logType, productId, serviceId, sn, logContent);
                return;
            }

            var jEsbResponse = EsbService.getEsbResponse(jResult);
            if (!jEsbResponse) {
                logContent = "商品ID为【" + productId + "】接口对接失败，失败原因：RESPONSE数据返回格式异常";
                OmsEsbLogService.addLog(logType, productId, serviceId, sn, logContent);
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

            logContent = "商品ID为【" + productId + "】接口对接失败，失败原因：" + JSON.stringify(jEsbResponse);
            OmsEsbLogService.addLog(logType, productId, serviceId, sn, logContent);
        },
        deleteTask: function (taskId) {
            if (!taskId) {
                return;
            }
            if (JobsApi) {
                //因为是加到oms队列里的，所以是从oms队列删除
                JobsApi.IsoneJobsEngine.omsTaskRunner.deleteTask(taskId);
            }
        },
        saveTaskId: function (merchantId, taskId) {
            if (!merchantId || !taskId) {
                return;
            }
            var id = prefix_obj + "_" + merchantId + "_task";
            var oldTaskId = f.getTaskId(merchantId);
            if (oldTaskId) {
                f.deleteTask(oldTaskId);//在新增加task时，将旧的task删除
            }
            var obj = {
                taskId: taskId
            };
            pigeon.saveObject(id, obj);
        },
        getTaskId: function (merchantId) {
            var id = prefix_obj + "_" + merchantId + "_task";
            var obj = pigeon.getObject(id);
            if (obj && obj.taskId) {
                return obj.taskId;
            }
            return null;
        },
        getQtyExchangeListName: function (merchantId) {
            return prefix_list + merchantId;
        },
        getO2OQtyExchangeListName: function (merchantId) {
            return prefix_list + "o2o_" + merchantId;
        },
        //获取库存对接队列
        getQtyExchangeList: function (merchantId, start, limit) {
            return pigeon.getList(f.getQtyExchangeListName(merchantId), start, limit);
        },
        //获取020库存对接队列
        getO2OQtyExchangeList: function (merchantId, start, limit) {
            return pigeon.getList(f.getO2OQtyExchangeListName(merchantId), start, limit);
        },
        //获取库存对接队列大小
        getQtyExchangeListSize: function (merchantId) {
            return pigeon.getListSize(f.getQtyExchangeListName(merchantId));
        },
        /**
         * 将商品加入到对接队列
         * @param merchantId
         * @param productId
         */
        addProductToExchangeList: function (merchantId, productId) {
            if (!merchantId || !productId) {
                return;
            }
            pigeon.addToList(f.getQtyExchangeListName(merchantId), productId, productId);
        },
        /**
         * 将商品加入到对接队列
         * @param merchantId
         * @param productId
         */
        addProductToO2OExchangeList: function (merchantId, productId) {
            if (!merchantId || !productId) {
                return;
            }
            pigeon.addToList(f.getO2OQtyExchangeListName(merchantId), productId, productId);
        },
        /**
         * 对比商品的实际库存有没有发生变化，如果发生变化就加入到对接队列
         * @param merchantId
         * @param productId
         * @param skuId
         * @param newAmount
         * @param shipNode 仓库节点，不传就用默认的ShipNode
         */
        updateSkuRealAmount: function (merchantId, productId, skuId, newAmount, shipNode) {
            if (!merchantId || !productId || !skuId) {
                return;
            }
            if (!newAmount) {
                newAmount = 0;
            }
            var defaultShipNode = OmsControlArgService.getDefaultShipNode(merchantId) || "";
            if (shipNode) {
                defaultShipNode = shipNode;
            }

            var skuQty = SkuService.getSkuAllQuantity(skuId);
            if (skuQty) {
                var values = skuQty.values;
                if (values) {
                    var realAmount = values[defaultShipNode] == undefined ? "0" : values[defaultShipNode];
                    if (realAmount != newAmount || Number(newAmount) > 0) {
                        f.addProductToExchangeList(merchantId, productId);
                        if (realAmount != newAmount) {
                            InventoryManageService.addLog(productId, skuId, merchantId, newAmount, shipNode, realAmount);
                        }
                    }
                } else {
                    f.addProductToExchangeList(merchantId, productId);
                    InventoryManageService.addLog(productId, skuId, merchantId, newAmount, shipNode);
                }
            } else {
                f.addProductToExchangeList(merchantId, productId);
                InventoryManageService.addLog(productId, skuId, merchantId, newAmount, shipNode);
            }
            //保存到数据库
            SkuService.updateSkuQuantity(skuId, defaultShipNode, newAmount, shipNode);
        },
        /**
         * 对比商品的实际库存有没有发生变化，如果发生变化就加入到对接队列,o2o商品5分钟后执行对接
         * @param merchantId
         * @param productId
         * @param skuId
         * @param newAmount
         * @param shipNode 仓库节点，不传就用默认的ShipNode
         */
        updateSkuRealAmountAndExchange: function (merchantId, productId, skuId, newAmount, shipNode) {
            if (!merchantId || !productId || !skuId) {
                return;
            }
            if (!newAmount) {
                newAmount = 0;
            }
            var defaultShipNode = OmsControlArgService.getDefaultShipNode(merchantId) || "";
            if (shipNode) {
                defaultShipNode = shipNode;
            }

            var skuQty = SkuService.getSkuAllQuantity(skuId);
            if (skuQty) {
                var values = skuQty.values;
                if (values) {
                    var realAmount = values[defaultShipNode] == undefined ? "" : values[defaultShipNode];
                    if (realAmount != newAmount) {
                        //f.exchangeToOms(merchantId, productId);
                        f.addProductToO2OExchangeList(merchantId, productId);
                        InventoryManageService.addLog(productId, skuId, merchantId, newAmount, shipNode, realAmount);
                    }
                } else {
                    //f.exchangeToOms(merchantId, productId);
                    f.addProductToO2OExchangeList(merchantId, productId);
                    InventoryManageService.addLog(productId, skuId, merchantId, newAmount, shipNode);
                }
            } else {
                //f.exchangeToOms(merchantId, productId);
                f.addProductToO2OExchangeList(merchantId, productId);
                InventoryManageService.addLog(productId, skuId, merchantId, newAmount, shipNode);
            }
            //保存到数据库
            SkuService.updateSkuQuantity(skuId, defaultShipNode, newAmount);
        },
        /**
         * 立即对接库存到OMS
         * @param productId
         * @param merchantId
         */
        exchangeToOms: function (merchantId, productId) {
            var jobPageId = "task/doSendOnSkuQuantityToOMS.jsx";
            var when = (new Date()).getTime() + 5 * 1000; //5秒后对接
            var postData = {
                productId: productId,
                merchantId: merchantId
            };
            JobsService.submitOmsTask("omsEsb_product", jobPageId, postData, when);
        },
        /**
         * 将商品从对接队列删除
         * @param merchantId
         * @param productId
         */
        deleteFormExchangeList: function (merchantId, productId) {
            if (!merchantId || !productId) {
                return;
            }
            pigeon.deleteFromList(f.getQtyExchangeListName(merchantId), productId, productId);
        },
        /**
         * 将商品从对接队列删除
         * @param merchantId
         * @param productId
         */
        deleteFormO2OExchangeList: function (merchantId, productId) {
            if (!merchantId || !productId) {
                return;
            }
            pigeon.deleteFromList(f.getO2OQtyExchangeListName(merchantId), productId, productId);
        }

    };
    return f;
})($S);