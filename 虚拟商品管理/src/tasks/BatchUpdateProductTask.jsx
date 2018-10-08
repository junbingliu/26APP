//#import Util.js
//#import productImportOrExport.js
//#import excel.js
//#import log.js
//#import product.js
//#import open-product.js
//#import sysArgument.js
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
            var jLog = LogService.getNewInitLog(merchantId, userId, "ImportVirtualProductFromExcelLog");
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
            logInfo = "【批量修改】导入文件地址：<a href='" + filePath + "' target='_blank'>" + filePath + "</a>";
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

            var jConfig = {};
            jConfig.isAddIfSamePrice = false;

            for (var j = beginLine - 1; j < endLine; j++) {

                try {
                    var row = rows[j];
                    var cells = row.cells;
                    var typeValue = getCellValue(cells, findTypeIndex);
                    var channel = getCellValue(cells, findChannelIndex);
                    var sellableCount = getCellValue(cells, findSellCountIndex);
                    var marketPrice = getCellValue(cells, findMarketPriceIndex);
                    var memberPrice = getCellValue(cells, findMemberPriceIndex);

                    if (typeValue == "" && channel == "" && sellableCount == "" && marketPriceIndex == "" && memberPriceIndex == "") {
                        logInfo = "第[" + j + "]行 " + "导入失败，失败原因：当前行为空行";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }

                    // 将渠道中文名称转换成相对应的数字   1：微商城  2：APP 3：其他渠道
                    channel = channel == "APP" ? "app" : (channel == "微商城" ? "h5" : "all");

                    var jSkuInfo = {};
                    jSkuInfo.sellableCount = sellableCount;
                    jSkuInfo.marketPrice = marketPrice;
                    jSkuInfo.memberPrice = memberPrice;
                    jSkuInfo.channel = channel;
                    if (findType == "sku") {
                        jSkuInfo.realSkuId = typeValue;
                    } else {
                        jSkuInfo.barcode = typeValue;
                    }

                    var jResult = OpenProductService.updateSku(merchantId, jSkuInfo, userId, jConfig);
                    if (jResult.code != "0") {
                        logInfo = "第[" + (j + 1) + "]行 " + "修改失败，失败原因：" + jResult.msg;
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }

                    var productId = jResult.productId;
                    var jProduct = ProductService.getProduct(productId);
                    jProduct.channel = channel;
                    ProductService.updateProduct(productId, jProduct, userId, jProduct.merchantId);

                    logInfo = "第[" + (j + 1) + "]行 " + "修改成功";
                    jLog = LogService.saveLog(jLog, logInfo);
                    totalSuccess++;

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
