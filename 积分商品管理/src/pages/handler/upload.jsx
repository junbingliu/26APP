//#import Util.js
//#import excel.js
//#import login.js
//#import user.js
//#import file.js
//#import sku.js
//#import column.js
//#import log.js
//#import code2merchant.js
//#import $integralProductManage:services/priceUtil.jsx
//#import $integralProductManage:services/IntegralRuleService.jsx
//#import $integralProductManage:services/IntegralRuleLogService.jsx
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
        var jLog = LogService.getNewInitLog(merchantId, userId, "integral_product_manager_import");

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

                var typeNameCell = getCell(cells, 2);
                if (!typeNameCell || !typeNameCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行商品分类为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行商品分类为空");
                    // out.print(msg);
                    continue;
                }


                var moneyCell = getCell(cells, 3);
                if (!moneyCell || !moneyCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行现金为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行现金为空");
                    // out.print(msg);
                    continue;
                }

                var jifenCell = getCell(cells, 4);
                if (!jifenCell || !jifenCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行积分值为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行积分值为空");
                    // out.print(msg);
                    continue;
                }

                var merchantId = merchantIdCell.value.trim();
                if (merchantId.indexOf('m_') == -1) {
                    merchantId = Code2MerchantService.getMerchantIdByMerchantName(merchantId);
                }
                var skuNo = skuNoCell.value.trim();
                var typeName = typeNameCell && typeNameCell.value && typeNameCell.value.trim();
                var type = IntegralRuleService.getTypeByKey(typeName);
                if (!type || type === "") {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：商品分类不存在!" + skuNo;
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：商品分类不存在!" + skuNo);
                    continue;
                }
                var money = moneyCell && moneyCell.value && moneyCell.value.trim();
                if (!PriceUtil.isNumber(money)) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：现金必须为数字!" + skuNo;
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：现金必须为数字!" + skuNo);
                    continue;
                }
                var jifen = jifenCell && jifenCell.value && jifenCell.value.trim();
                if (!PriceUtil.isNumber(jifen)) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：积分值必须为数字!" + skuNo;
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：积分值必须为数字!" + skuNo);
                    continue;
                }
                var judge_result = judgeIntegralValueByType(money, jifen, type);
                if (judge_result.code !== "0") {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + " " + judge_result.msg;
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + " " + judge_result.msg);
                    continue;
                }
                var productId = SkuService.getProductIdByRealSkuId(merchantId, skuNo);
                if (!productId) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + " 找不到对应的商品";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + " 找不到对应的商品");
                    continue;
                }
                var product = ProductService.getProduct(productId);
                if (!product) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + " 找不到对应的商品";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + " 找不到对应的商品");
                    continue;
                }
                var jSku = SkuService.getSkuByRealSkuIdEx(productId, skuNo);
                if (!jSku) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + "找不到对应的SKU";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：" + skuNo + "找不到对应的SKU");
                    continue;
                }
                var integral_rule = {
                    "productId": productId,
                    "name": product.name,
                    "skuId": jSku.id,
                    "realSkuId": skuNo,
                    "merchantId": merchantId,
                    "type": type,
                    "money": money,
                    "jifen": jifen,
                    "createUserId": userId
                }
                var ruleId = null;
                var relation_rule = IntegralRuleService.getById("integralRule_" + productId);
                if (relation_rule) {
                    ruleId = relation_rule.ruleId;
                }
                if (ruleId && ruleId !== "") {
                    var old_rule = IntegralRuleService.getById(ruleId);
                    integral_rule = mergeRule(old_rule, integral_rule);
                    IntegralRuleService.update(ruleId, integral_rule);
                    integral_rule.operationType = "update";
                    createLog(old_rule, integral_rule, userId);
                } else {
                    ruleId = IntegralRuleService.add(integral_rule);
                    integral_rule.operationType = "add";
                    integral_rule.ruleId = ruleId;
                    createLog(null, integral_rule, userId);
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

function mergeRule(old_rule, new_rule) {
    var result = null;
    if (!old_rule) {
        return result;
    }
    if (!new_rule) {
        return old_rule;
    }
    var keys = Object.keys(new_rule);
    result = JSON.parse(JSON.stringify(old_rule));
    keys.forEach(function (key) {
        var value = new_rule[key];
        result[key] = value;
    });
    return result;
}

function createLog(old_rule, integral_rule, createUserId) {
    integral_rule.beginMoney = old_rule && old_rule.money || "0";
    integral_rule.endMoney = integral_rule.money;
    integral_rule.beginJifen = old_rule && old_rule.jifen || "0";
    integral_rule.endJifen = integral_rule.jifen;
    integral_rule.createUserId = createUserId;
    if (integral_rule.operationType === "update") {
        delete integral_rule.createTime;
    }
    IntegralRuleLogService.add(integral_rule);
}

function judgeIntegralValueByType(money, jifen, type) {
    var result = {"code": "0"};
    money = Number(money);
    jifen = Number(jifen);
    if (jifen <= 0) {
        result.msg = "积分必须大于0";
        result.code = "100";
        return result;
    }
    if ((type === "all_integral" || type === "all_coupon") && money > 0) {
        result.msg = "现金只能设置在【积分加钱换购商品】商品分类";
        result.code = "101";
        return result;
    }
    return result;
}


function getCell(cells, index) {
    for (var i = 0; i < cells.length; i++) {
        var jCell = cells[i];
        if (jCell.columnIndex == index) {
            return jCell;
        }
    }
    return null;
}



