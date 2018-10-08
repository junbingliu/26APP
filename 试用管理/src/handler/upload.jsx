//#import Util.js
//#import excel.js
//#import login.js
//#import user.js
//#import file.js
//#import sku.js
//#import log.js
//#import code2merchant.js
//#import sysArgument.js
//#import $tryOutManage:services/tryOutManageServices.jsx

/**
 * 产生中奖名单时，会上传一份，剔除名单
 */

(function () {
    var result = {
        state: "err"
    };
    var beginTime = (new Date()).getTime();
    var userId = LoginService.getBackEndLoginUserId();
    var m = $.getDefaultMerchantId();
    var userJson = {};
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
        var jLog = LogService.getNewInitLog(merchantId, userId, "application_delete_user_import");
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

        var activeId = "tryOutManage_"+rows[1].cells[0].value;
        var activeObj = tryOutManageServices.getById(activeId);
        if(!activeObj){
            jLog = LogService.saveLog(jLog, "活动不存在");
            return
        }
        var productId = rows[1].cells[2].value;
        var productObj = ProductService.getProduct(productId);
        if(!productObj){
            jLog = LogService.saveLog(jLog, "商品不存在");
            return
        }
        for (var j = 1; j < rows.length; j++) {
            try {
                total++;
                var row = rows[j];
                var cells = row.cells;
                var userCell = getCell(cells, 1);
                if (!userCell || !userCell.value) {
                    totalSkip++;
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行用户ID为空";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行用户ID为空");
                    //out.print(msg);
                    continue;
                }
                var userIds = userCell.value.trim();
                userJson[userIds] = userIds;
                totalAdd++;
            } catch (e) {
                totalError++;
                msg += "<br>第" + j + "行出现异常：" + e;
                jLog = LogService.saveLog(jLog, "<br>第" + j + "行出现异常：" + e);
            }
        }
        var obj = {
            activeId:activeId,
            productId:productId,
            userJson:userJson
        };
        var uId = activeId+"_"+productId+"out";
        tryOutManageServices.addObj(uId,obj);
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
        out.print(JSON.stringify(jLog));
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