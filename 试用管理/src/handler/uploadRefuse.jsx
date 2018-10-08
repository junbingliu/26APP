//#import Util.js
//#import excel.js
//#import login.js
//#import user.js
//#import file.js
//#import sku.js
//#import log.js
//#import product.js
//#import code2merchant.js
//#import sysArgument.js
//#import eventBus.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
//#import $oleMobileApi:server/util/TryUseUtil.jsx

/**
 * 这是批量拒绝的接口
 */

(function () {
    var result = {
        state: "err"
    };
    var beginTime = (new Date()).getTime();
    var userId = LoginService.getBackEndLoginUserId();
    var m = $.getDefaultMerchantId();
    var userJson = {};
    var remarksJson = {};
    if (!userId) {
        result.msg = "请先登录";
        out.print(JSON.stringify(result));
        return;
    }
    var total = 0;
    var totalAdd = 0;
    var totalSkip = 0;
    var totalError = 0;
    try {
        var jFileInfos = $.uploadFiles("xls,xlsx", 1024 * 1024 * 10);
        if (!jFileInfos) {
            //jLog = LogService.saveLog(jLog, "文件上传失败");
            result.msg = "文件上传失败";
            return;
        }
        var jFileInfo = jFileInfos[0];
        if (!jFileInfo) {
            result.msg = "获取文件失败";
            //jLog = LogService.saveLog(jLog, "获取文件失败");
            return;
        }
        var jParameters = jFileInfo["parameters"];
        var merchantId = jParameters["m"];
        if (!merchantId) {
            merchantId = $.getDefaultMerchantId();
        }
        var jLog = LogService.getNewInitLog(merchantId, userId, "application_report_user_import");

        var fileId = jFileInfo.fileId;
        var filePath = FileService.getInternalPath(fileId);
        jLog = LogService.saveLog(jLog, "导入文件路径:<a href='" + filePath + "'>" + filePath + "</a>");
        var jData = Excel.parse(filePath);
        if (!jData) {
            result.msg = "读取Excel文件失败";
            jLog = LogService.saveLog(jLog, "读取Excel文件失败");
            return;
        }
        if (!jData.sheets || jData.sheets.length == 0) {
            result.msg = "Excel中的sheet为空";
            jLog = LogService.saveLog(jLog, "Excel中的sheet为空");
            return;
        }
        var sheet = jData.sheets[0];
        var rows = sheet.rows;
        var msg = "";

        var activeId = rows[1].cells[7].value;
        $.log("------activeId=" + activeId);
        var activeObj = tryOutManageServices.getById(activeId);
        if (!activeObj) {
            jLog = LogService.saveLog(jLog, "活动不存在");
            result.msg = "活动不存在";
            return;
        }
        jLog = LogService.saveLog(jLog, "试用活动名称:" + activeObj.title+",批量导入试用审核不通过名单");

        var productId = rows[1].cells[9].value;
        $.log("------productId=" + productId);
        var productObj = ProductService.getProduct(productId);
        if (!productObj) {
            jLog = LogService.saveLog(jLog, "商品不存在");
            result.msg = "商品不存在";
            return;
        }
        var list = [];
        for (var j = 1; j < rows.length; j++) {
            try {
                total++;
                var row = rows[j];
                var cells = row.cells;
                var userCell = getCell(cells, 8);
                if (!userCell || !userCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行用户ID为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行用户ID为空");
                    continue;
                }
                var userIds = userCell.value.trim();
                userJson[userIds] = userIds;
                var remarksCell = getCell(cells, 10);
                remarksJson[userIds] = remarksCell.value;

                var productId2 = rows[j].cells[9].value;//商品id
                var activeId2 = rows[j].cells[7].value;//活动id
                if(productId != productId2 || activeId != activeId2){
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：一次只能导入一个活动一个商品的名单";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：一次只能导入一个活动一个商品的名单");
                    continue;
                }
                var obj = {
                    productId: productId2,
                    activeId: activeId2,
                    userId: userIds
                };
                var objId = TrialProductService.getObjectId(obj.userId, obj.activeId, obj.productId);
                var obj2 = TrialProductService.getObject(objId);
                if (obj2 && obj2.state == "1") {
                    totalSkip++;
                    repeatCount++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行已经是审核通过状态，不能修改成审核不通过状态";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行已经是审核通过状态，不能修改成审核不通过状态");
                    continue;
                }
                if (obj2 && obj2.state == "0") {
                    totalSkip++;
                    repeatCount++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行已经是审核不通过状态";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行已经是审核不通过状态");
                    continue;
                }
                list.push(obj);

                totalAdd++;
            } catch (e) {
                totalError++;
                msg += "<br>第" + j + "行出现异常：" + e;
                jLog = LogService.saveLog(jLog, "<br>第" + j + "行出现异常：" + e);
            }
        }

        var repeatCount = 0;
        //批量修改状态
        for (var g = 0; g < list.length; g++) {
            var item = list[g];
            var objId = TrialProductService.getObjectId(item.userId, item.activeId, item.productId);
            var obj = TrialProductService.getObject(objId);
            //此判断是是验证搜出来的申请id是否在excel里
            if (userJson[obj.userId]) {
                //申请状态 0没通过 1通过 2没操作过的
                if (obj.state == "0" || obj.state == "1") {
                    totalAdd--;
                    totalSkip++;
                    repeatCount++;
                    continue;
                }
                obj.state = "0";
                obj.controlUser = userId;
                obj.applicationTime = new Date().getTime();
                obj.remarks = remarksCell[obj.userId] || "";
                var ok = TrialProductService.update(obj.id, obj);
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
        result.addCount = totalAdd;
        result.skipCount = totalSkip;
        result.errorCount = totalError;
        result.totalCount = total;
        result.repeatCount = repeatCount;
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