//#import Util.js
//#import file.js
//#import excel.js
//#import sku.js
//#import product.js
//#import merchant.js
//#import inventory.js
//#import code2merchant.js
(function () {
    try {
        var jFileInfos = $.uploadFiles("xls,xlsx", 1024 * 1024 * 10);
        var res = {state: "error"};
        if (!jFileInfos) {
            res.msg = "文件上传失败";
            out.print(JSON.stringify(res));
            return;
        }
        var jFileInfo = jFileInfos[0];
        if (!jFileInfo) {
            res.msg = "获取文件失败";
            out.print(JSON.stringify(res));
            return;
        }
        var filePath = FileService.getInternalPath(jFileInfo['fileId']);
        var jData = Excel.parse(filePath);

        if (!jData) {
            res.msg = "读取Excel文件失败";
            out.print(JSON.stringify(res));
            return;
        }
        if (!jData['sheets'] || jData['sheets'].length == 0) {
            res.msg = "Excel中的sheet为空";
            out.print(JSON.stringify(res));
            return;
        }
        var sheet = jData['sheets'][0];
        var rows = sheet['rows'];
        if (!rows) {
            res.msg = "Excel中的rows为空";
            out.print(JSON.stringify(res));
            return;
        }

        var getCellValue = function (cells, index) {
            for (var i = 0; i < cells.length; i++)
                if (cells[i]['columnIndex'] == index) {
                    var val = cells[i]['value'];
                    if (typeof val === "string")
                        return val.trim();
                    else
                        return val;
                }
            return ""
        };
        var getMerchantName = function (merchantId) {
            try {
                return MerchantService.getMerchant(merchantId).name_cn;
            } catch (e) {
                return merchantId
            }
        };

        var products = [];
        var log = {
            successLength: 0,
            errorLength: 0,
            list: []
        };
        for (var i = 1; i < rows.length; i++) {
            var cells = rows[i]['cells'];
            if (!cells || cells.length == 0) {
                log.list.push({
                    state: 'error',
                    excelIndex: i + 1,
                    productName: "",
                    skuId: "",
                    merchantId: "",
                    msg: "第" + (i + 1) + "行数据为空"
                });
                log.errorLength++;
                continue
            }
            var skuId = getCellValue(cells, 0);
            var productName = getCellValue(cells, 1);
            var merchantId = getCellValue(cells, 2);
            var shortIndex = getCellValue(cells, 3) || 0;
            if (skuId) {
                if (!merchantId) {
                    log.list.push({
                        state: 'error',
                        excelIndex: i + 1,
                        productName: productName,
                        skuId: skuId,
                        merchantId: getMerchantName(merchantId),
                        msg: "上传格式错误，商家ID或名称没有填写。"
                    });
                    log.errorLength++;
                    continue
                }
                var productId = "null";
                //如果填写的是商家名称
                if (merchantId.indexOf("m_") == -1) {
                    merchantId = Code2MerchantService.getMerchantIdByMerchantName(merchantId);
                    if (merchantId == "null") {
                        log.list.push({
                            state: 'error',
                            excelIndex: i + 1,
                            productName: productName,
                            merchantId: getCellValue(cells, 2),
                            skuId: skuId,
                            msg: "商家ID或商家名称有误"
                        });
                        log.errorLength++;
                        continue
                    }
                }
                productId = SkuService.getProductIdByRealSkuId(merchantId, skuId);

                if (productId == "null") {
                    log.list.push({
                        state: 'error',
                        excelIndex: i + 1,
                        productName: productName,
                        merchantId: getMerchantName(merchantId) || getCellValue(cells, 2),
                        skuId: skuId,
                        msg: merchantId ? "对应商家无对应商品" : "商家有误"
                    });
                    log.errorLength++;
                    continue
                }
            } else {
                log.list.push({
                    state: 'error',
                    excelIndex: i + 1,
                    productName: productName,
                    skuId: skuId,
                    merchantId: getMerchantName(merchantId),
                    msg: "上传格式，错误SKU编码没有填写。"
                });
                log.errorLength++;
                continue
            }
            var productInfo = ProductService.getProduct(productId);
            if (!productInfo) {
                log.list.push({
                    state: 'error',
                    excelIndex: i + 1,
                    productId: productId,
                    productName: productName,
                    skuId: skuId,
                    merchantId: getMerchantName(merchantId),
                    msg: "对应商家无对应商品"
                });
                log.errorLength++;
                continue
            }
            if (productInfo.noversion.publishState != "1") {
                log.list.push({
                    state: 'error',
                    excelIndex: i + 1,
                    productId: productId,
                    productName: productName,
                    skuId: skuId,
                    merchantId: getMerchantName(merchantId),
                    msg: "无对应商品在架"
                });
                continue
            }
            if (InventoryService.getProductSellableCount(productInfo) < 1) {
                log.list.push({
                    state: 'error',
                    excelIndex: i + 1,
                    productId: productId,
                    productName: productName,
                    skuId: skuId,
                    merchantId: getMerchantName(merchantId),
                    msg: "售馨"
                });
                continue
            }
            var jSku = SkuService.getSkuByRealSkuIdEx(productId, skuId);
            var innerSkuId = jSku && jSku.id;
            var item = {};
            item.id = productInfo.objId.toLocaleLowerCase();
            item.name = productInfo.name;
            item.weight = productInfo.weight;
            var merchant = MerchantService.getMerchant(productInfo.merchantId);
            item.merchantName = merchant.name_cn;
            item.sellingPoint = productInfo.sellingPoint;
            item.memberPrice = ProductService.getMemberPriceBySku(productId, innerSkuId) || "";
            item.marketPrice = ProductService.getMarketPriceBySkuId(productInfo, innerSkuId) || "";
            if (item.memberPrice) {
                item.memberPrice = parseFloat(item.memberPrice).toFixed(2);
            } else {
                item.memberPrice = "暂无价格";
            }
            if (item.marketPrice && item.marketPrice.unitPrice) {
                item.marketPrice = (parseFloat(item.marketPrice.unitPrice) / 100).toFixed(2);
            } else {
                item.marketPrice = "暂无价格";
            }
            var pics = ProductService.getPics(productInfo);
            if (pics && pics.length > 0) {
                item.imgUrl = FileService.getRelatedUrl(pics[0]["fileId"], "100X100");
            } else {
                item.imgUrl = "../upload/nopic_100.gif";
            }
            item.salesAmount = 0;
            item.skuId = skuId;
            item.merchantId = merchantId;
            item.productName = productName;
            item.shortIndex = shortIndex;
            products.push(item);
            log.successLength++;
            log.list.push({
                state: 'ok',
                excelIndex: i + 1,
                productId: productId,
                productName: productName,
                skuId: skuId,
                merchantId: getMerchantName(merchantId),
                msg: "成功"
            });
        }
        out.print(JSON.stringify({
            state: "ok",
            log: log,
            products: products
        }));
    } catch (e) {
        out.print(JSON.stringify({
            state: "err",
            log: {},
            products: [],
            msg: e + ""
        }));
    }

})();