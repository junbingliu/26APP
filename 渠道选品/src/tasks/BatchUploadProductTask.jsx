//#import Util.js
//#import productImportOrExport.js
//#import excel.js
//#import log.js
//#import product.js
//#import open-product.js
//#import sysArgument.js
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx
;
(function () {
        try {
            if (!filePath || filePath == "") {
                $.log("BatchUploadProductTask.jsx....数据包文件上传失败或者获取失败");
                return;
            }
            var logInfo;
            var totalSuccess = 0;
            var totalFailed = 0;
            var beginTime = (new Date()).getTime();
            var jLog = LogService.getNewInitLog(merchantId, userId, "ImportChannelProductFromExcelLog");
            var jData = Excel.parse(filePath);
            if (!jData) {
                logInfo = "读取Excel文件失败";
                jLog = LogService.saveLog(jLog, logInfo);
                return;
            }
            if (!jData.sheets || jData.sheets.length == 0) {
                logInfo = "Excel中的sheet为空";
                jLog = LogService.saveLog(jLog, logInfo);
                return;
            }
            logInfo = "导入文件地址：<a href='" + filePath + "' target='_blank'>" + filePath + "</a>";
            jLog = LogService.saveLog(jLog, logInfo);

            var sheet = jData.sheets[0];
            var rows = sheet.rows;
            var beginLine = beginLine || 2;
            var endLine = endLine || -1;
            if (!beginLine || beginLine == "") {
                beginLine = 2;
            }
            if (!endLine || endLine == "" || endLine == -1) {
                endLine = rows.length;
            }

            //获取ole商家Id
            var ole_merchantId = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument", "ole_merchantId");
            //获取该商家下的所有商品Id
            var productIds = ProductService.getProductIds("c_10000", ole_merchantId, 0, -1);

            for (var j = beginLine - 1; j < endLine; j++) {

                try {
                    var row = rows[j];
                    var cells = row.cells;
                    var tableMerchantId = getCellValue(cells, findMerchantIdIndex);
                    var type = getCellValue(cells, findTypeIndex);
                    var channel = getCellValue(cells, findChannelIndex);
                    var sellCount = getCellValue(cells, findSellCountIndex);
                    var publishState = getCellValue(cells, findPublishStateIndex);

                    if (type == "" && channel == "" && sellCount == "" && publishState == "" && tableMerchantId == "") {
                        logInfo = "第[" + j + "]行 " + "导入失败，失败原因：当前行为空行";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }

                    if (tableMerchantId != ole_merchantId) {
                        logInfo = "第[" + j + "]行 " + "导入失败，失败原因：商家Id和系统参数获取的ole商家Id不匹配";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }
                    // 将渠道中文名称转换成相对应的数字   1：微商城  2：APP 3：其他渠道
                    channel = channel == "APP" ? "app" : (channel == "微商城" ? "h5" : "all");
                    //将上下架状态转换成对应的数字值   1：上架  0：下架
                    publishState = publishState == "上架" ? "1" : "0";
                    var tempNum = 0;
                    var length = productIds.length;
                    for (var p = 0; p < productIds.length; p++) {

                        var productId = productIds[p];
                        var product = ProductService.getProduct(productId);
                        var headSku = ProductService.getHeadSku(productId);//默认sku;
                        if (findType == "sku") {
                            if (headSku.skuId == type) {
                                handler(channel, productId, product, userId, sellCount, publishState, headSku);
                                logInfo = "第[" + j + "]行 " + "导入成功";
                                jLog = LogService.saveLog(jLog, logInfo);
                                totalSuccess++;
                            } else {
                                tempNum++;
                            }
                        } else {

                            var skus = ProductService.getSkus(productId);//sku;
                            for (var s = 0; s < skus.length; s++) {
                                var sku = skus[s];
                                var barcode = sku.barcode;//条形码
                                if (barcode == type) {
                                    handler(channel, productId, product, userId, sellCount, publishState, headSku);
                                    logInfo = "第[" + j + "]行 " + "导入成功";
                                    jLog = LogService.saveLog(jLog, logInfo);
                                    totalSuccess++;
                                } else {
                                    tempNum++;
                                }
                            }
                        }

                    }
                    if (tempNum == length) {
                        logInfo = "第[" + j + "]行 " + "导入失败，失败原因：不存在相对应的" + findType;
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }

                }
                catch (e) {
                    totalFailed++;
                    logInfo = "第" + j + "行 导入失败，失败原因：" + e;
                    jLog = LogService.saveLog(jLog, logInfo);
                }
            }

        }
        catch (e) {
            $.log("BatchUploadProductImageTask.jsx....操作出现异常:" + e);
            logInfo = "导入出现异常，异常信息为：" + e;
            jLog = LogService.saveLog(jLog, logInfo);
        }
        finally {
            var endTime = (new Date()).getTime();
            logInfo = "总耗时=" + (endTime - beginTime) + "毫秒";
            logInfo += "。共成功导入数量=" + totalSuccess;
            logInfo += "; 未导入总数量=" + totalFailed;
            jLog = LogService.realSaveLog(jLog, logInfo);
        }
    }
)();

function getCell(cells, index) {
    if (!cells || !index || index == "") {
        return null;
    }

    index = index - 1;
    for (var i = 0; i < cells.length; i++) {
        var jCell = cells[i];
        //$.log("\n.............jCell.columnIndex=" + jCell.columnIndex);
        if (jCell.columnIndex == index) {
            return jCell;
        }
    }
    return null;
}

//获取Excel对应的值
function getCellValue(cells, index) {
    var jCell = getCell(cells, index);
    if (jCell) {
        return jCell.value;
    }
    return "";
}


function handler(channel, productId, product, userId, sellCount, publishState, headSku) {
    //如果有渠道就修改
    if (channel) {
        product.channel = channel;
        ProductService.updateProduct(productId, product, userId, product.merchantId);
    }
    if (sellCount && sellCount != "0") {
        var freezeAmount = ProductService.getFreezeAmount(productId, headSku.id);
        var realAmount = Number(freezeAmount) + Number(sellCount);
        // ProductService.setRealAmount(productId, headSku.id, realAmount);
        //修改物料的库存改成修改库存中心的库存，这样会触发对接到oms
        OmsEsbProductService.updateSkuRealAmount(product.merchantId, productId, headSku.id, realAmount);
    }
    if (publishState && publishState != "") {
        if (publishState == "0") {
            //下架
            OpenProductService.updateProductToDown(productId);
        } else {
            //上架
            OpenProductService.updateProductToUp(productId);
        }
    }
}