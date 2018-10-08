//#import Util.js
//#import excel.js
//#import login.js
//#import user.js
//#import file.js
//#import sku.js
//#import inventory.js
//#import column.js
//#import log.js
//#import code2merchant.js
//#import open-product.js
//#import $OmsEsbControlCenter:services/OmsControlArgService.jsx
//#import $OmsEsbProduct:services/OmsEsbProductService.jsx
;
(function () {
    var result = {
        state: "err"
    };
    var beginTime = (new Date()).getTime();
    var userId = LoginService.getBackEndLoginUserId();

    if (!userId) {
        out.print("请先登录");
        return;
    }
    var total = 0;
    var totalAdd = 0;
    var totalSkip = 0;
    var totalError = 0;
    try {

        var jFileInfos = $.uploadFiles("xls,xlsx", 1024 * 1024 * 10);
        if (!jFileInfos) {
            out.print("文件上传失败");
            //jLog = LogService.saveLog(jLog, "文件上传失败");
            return;
        }
        var jFileInfo = jFileInfos[0];
        if (!jFileInfo) {
            out.print("获取文件失败");
            //jLog = LogService.saveLog(jLog, "获取文件失败");
            return;
        }
        var jParameters = jFileInfo["parameters"];
        var merchantId = jParameters["m"];
        if (!merchantId) {
            merchantId = $.getDefaultMerchantId();
        }
        var jLog = LogService.getNewInitLog(merchantId, userId, "inventory_manager_import");

        var fileId = jFileInfo.fileId;
        var filePath = FileService.getInternalPath(fileId);
        jLog = LogService.saveLog(jLog, "导入文件路径:<a href='" + filePath + "'>" + filePath + "</a>");
        var jData = Excel.parse(filePath);
        if (!jData) {
            out.print("读取Excel文件失败");
            jLog = LogService.saveLog(jLog, "读取Excel文件失败");
            return;
        }
        if (!jData.sheets || jData.sheets.length == 0) {
            out.print("Excel中的sheet为空");
            jLog = LogService.saveLog(jLog, "Excel中的sheet为空");
            return;
        }
        var sheet = jData.sheets[0];
        var rows = sheet.rows;
        var msg = "";
        for (var j = 1; j < rows.length; j++) {
            try {
                total++;
                var row = rows[j];
                var cells = row.cells;
                var merchantIdCell = getCell(cells, 0);

                if (!merchantIdCell || !merchantIdCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行商家ID为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行商家ID为空");
                    //out.print(msg);
                    continue;
                }

                var skuNoCell = getCell(cells, 1);
                if (!skuNoCell || !skuNoCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行SKU编码为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行SKU编码为空");
                    //out.print(msg);
                    continue;
                }

                var realAmountCell = getCell(cells, 2);
                /*if (!realAmountCell || !realAmountCell.value) {
                 totalSkip++;
                 var msg = "<br>第" + (j + 1) + "行被忽略，原因是：该行SKU编码为空";
                 out.print(msg);
                 continue;
                 }*/

                //var zeroSellableCell = getCell(cells, 3);
                /* if (!zeroSellableCell || !zeroSellableCell.value) {
                 totalSkip++;
                 var msg = "<br>第" + (j + 1) + "行被忽略，原因是：该行SKU编码为空";
                 out.print(msg);
                 continue;
                 }*/

                var zeroSellableCountCell = getCell(cells, 3);
                /*if (!zeroSellableCountCell || !zeroSellableCountCell.value) {
                 totalSkip++;
                 var msg = "<br>第" + (j + 1) + "行被忽略，原因是：该行SKU编码为空";
                 out.print(msg);
                 continue;
                 }*/

                var merchantId = merchantIdCell.value.trim();

                if (merchantId.indexOf('m_') == -1) {
                    merchantId = Code2MerchantService.getMerchantIdByMerchantName(merchantId);
                }

                var skuNo = skuNoCell.value.trim();
                var realAmount = realAmountCell && realAmountCell.value && realAmountCell.value.trim() || "";
                //var zeroSellable = zeroSellableCell && zeroSellableCell.value.trim() || "";
                var zeroSellableCount = zeroSellableCountCell && zeroSellableCountCell.value && zeroSellableCountCell.value.trim() || "";
                if (!realAmount && !zeroSellableCount) {
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：实际库存与零负可卖数同时为空!" + skuNo;
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：实际库存与零负可卖数同时为空!" + skuNo);
                    continue;
                }
                var defaultShipNode = OmsControlArgService.getDefaultShipNode(merchantId);

                var productId = SkuService.getProductIdByRealSkuId(merchantId, skuNo);
                if (!productId) {
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + "找不到对应的商品";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + "找不到对应的商品");
                    continue;
                }
                var jSku = SkuService.getSkuByRealSkuIdEx(productId, skuNo);
                if (!jSku) {
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + "找不到对应的SKU";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + "找不到对应的SKU");
                    continue;
                }
                var isExchangeOMS = OmsControlArgService.needExchangeToOms(merchantId);
                //保存实际库存
                if (realAmount) {
                    //如果是对接OMS的,那就要修改对接库存,如果不是的,就修改商品的实际库存
                    if (isExchangeOMS) {
                        //SkuService.updateSkuQuantity(jSku.id, defaultShipNode, realAmount);
                        OmsEsbProductService.updateSkuRealAmount(merchantId, productId, jSku.id, realAmount);
                    } else {
                        var jParam = {
                            outerId: skuNo,
                            merchantId: merchantId,
                            sellableCount: realAmount
                        };
                        OpenProductService.updateSkuSellableCount(jParam);
                    }
                }
                //保存零负可卖数
                if (zeroSellableCount) {
                    //如果是对接OMS的,那就要修改对接的零负可卖数,如果不是的,就修改商品的零负可卖数
                    if (isExchangeOMS) {
                        //SkuService.updateSkuQuantity(jSku.id, "zeroSellableCount", zeroSellableCount);
                        OmsEsbProductService.updateSkuRealAmount(merchantId, productId, jSku.id, zeroSellableCount,"zeroSellableCount");
                    } else {
                        jSku.zeroSellable = "1";
                        SkuService.updateSku(productId, jSku.id, jSku);
                        InventoryService.setZeroSellCount(productId, jSku.id, zeroSellableCount);
                    }
                }
                totalAdd++;
            } catch (e) {
                totalError++;
                msg += "<br>第" + j + "行出现异常：" + e;
                jLog = LogService.saveLog(jLog, "<br>第" + j + "行出现异常：" + e);
            }
        }
        msg += "<br><br>总处理数量：" + total;
        msg += "，成功导入总数量：" + totalAdd;
        msg += "，忽略跳过总数量：" + totalSkip;
        msg += "，出现异常总数量：" + totalError;
        jLog = LogService.saveLog(jLog, "总处理数量：" + total);
        jLog = LogService.saveLog(jLog, "成功导入总数量：" + totalAdd);
        jLog = LogService.saveLog(jLog, "忽略跳过总数量：" + totalSkip);
        jLog = LogService.saveLog(jLog, "出现异常总数量：" + totalError);
        result.state = "ok";
        result.msg = msg;
    } catch (e) {
        result.msg = "操作出现异常" + e;
        jLog = LogService.saveLog(jLog, "操作出现异常" + e);
    } finally {
        var endTime = (new Date()).getTime();
        var logInfo = "总耗时=" + (endTime - beginTime) + "毫秒";
        jLog = LogService.realSaveLog(jLog, logInfo);
        out.print(JSON.stringify(result));
    }
})();

function getCell(cells, index) {
    for (var i = 0; i < cells.length; i++) {
        var jCell = cells[i];
        if (jCell.columnIndex == index) {
            return jCell;
        }
    }
    return null;
}