//#import Util.js
//#import DateUtil.js
//#import user.js
//#import excel.js
//#import log.js
//#import login.js
//#import Info.js

(function () {
    var logInfo;
    var totalSuccess = 0;
    var totalFailed = 0;
    var beginTime = (new Date()).getTime();
    var jLog = LogService.getNewInitLog(merchantId, userId, "InfoUpdateLog");
    try {

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
        var user = UserService.getUser(userId);
        var us = {
            id: userId,
            realName: user.realName,
            nickName: user.nickName
        };
        var env = {
            now: new Date().getTime(),
            loginId: userId,
            loginUser: us
        };
        logInfo = "修改文件地址：<a href='" + filePath + "' target='_blank'>" + filePath + "</a>";
        jLog = LogService.saveLog(jLog, logInfo);

        var sheet = jData.sheets[0];
        var rows = sheet.rows;
        var beginLine = dataBeginLine || 2;
        var endLine = dataEndLine || -1;
        if (!beginLine || beginLine == "") {
            beginLine = 3;
        }
        if (!endLine || endLine == "" || endLine == -1) {
            endLine = rows.length;
        }
        var jLish = {};
        for (var j = beginLine - 1; j < endLine; j++) {
            try {
                var row = rows[j];
                var cells = row.cells;

                var objId = getCellValue(cells, objIdIndex);
                var channel = getCellValue(cells, channelIndex);
                var publishState = getCellValue(cells, publishStateIndex);

                if ((!objId || objId == "")) {
                    logInfo = "第[" + j + "]行 " + "修改失败，失败原因：资讯Id不能为空";
                    jLog = LogService.saveLog(jLog, logInfo);
                    totalFailed++;
                    continue;
                }
                if (channel != "App" && channel != "微商城" && channel != "所有") {
                    logInfo = "第[" + j + "]行 " + "修改失败，失败原因：渠道填写有误，只能是App或者微商城";
                    jLog = LogService.saveLog(jLog, logInfo);
                    totalFailed++;
                    continue;
                }
                if (publishState != "上架" && publishState != "下架") {
                    logInfo = "第[" + j + "]行 " + "修改失败，失败原因：上下架状态填写有误，只能是上架或者下架";
                    jLog = LogService.saveLog(jLog, logInfo);
                    totalFailed++;
                    continue;
                }
                if (channel == "App") {
                    channel = "app";
                } else if (channel == "微商城") {
                    channel = "h5";
                } else if (channel == "所有") {
                    channel = "all";
                }
                if (publishState == "上架") {
                    publishState = "1";
                } else if (publishState == "下架") {
                    publishState = "0";
                }

                //保存覆盖架状态
                if (radioStateValue == "0") {
                    if (!jLish[objId]) {
                        jLish[objId] = j;
                        var InfoObj = InfoService.getInfo(objId);
                        if (!InfoObj) {
                            logInfo = "第[" + j + "]行 的 objId 错误";
                            jLog = LogService.saveLog(jLog, logInfo);
                            totalFailed++;
                            continue;
                        }
                        InfoObj.channel = channel;
                        InfoObj.publishState = publishState;
                        InfoService.infoUpdate(objId, InfoObj, userId, InfoObj.columnId, merchantId, InfoObj._v);
                        totalSuccess++;
                    } else {
                        logInfo = "第[" + j + "]行 " + "重复记录跳过";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }
                }
                if (radioStateValue == "1") {
                    var InfoObj = InfoService.getInfo(objId);
                    if (!InfoObj) {
                        logInfo = "第[" + j + "]行 的 objId 错误";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }

                    InfoObj.channel = channel;
                    InfoObj.publishState = publishState;
                    InfoService.infoUpdate(objId, InfoObj, userId, InfoObj.columnId, merchantId, InfoObj._v);
                    totalSuccess++;
                    if (!jLish[objId]) {
                        jLish[objId] = j;
                    } else {
                        logInfo = "第[" + j + "]行 " + "重复记录已经覆盖";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                    }
                }
            }
            catch (e) {
                totalFailed++;
                logInfo = "第" + j + "行 修改失败，失败原因：" + e;
                jLog = LogService.saveLog(jLog, logInfo);
            }
        }

    } catch (e) {
        $.log("...................................batchUpdateProductBaseInfo....BatchUpdateTask.jsx....error=" + e);
        logInfo = "修改出现异常，异常信息为：" + e;
        jLog = LogService.saveLog(jLog, logInfo);
    } finally {
        var endTime = (new Date()).getTime();
        logInfo = "总耗时=" + (endTime - beginTime) + "毫秒";
        logInfo += "。共成功修改数量=" + totalSuccess;
        logInfo += "; 未修改总数量=" + totalFailed;
        jLog = LogService.realSaveLog(jLog, logInfo);
    }

})();

function getCell(cells, index) {
    if (!cells || !index || index == "") {
        return null;
    }

    index = index - 1;
    for (var i = 0; i < cells.length; i++) {
        var jCell = cells[i];
        $.log("\n.............jCell.columnIndex=" + jCell.columnIndex);
        if (jCell.columnIndex == index) {
            return jCell;
        }
    }
    return null;
}

function getCellValue(cells, index) {
    var jCell = getCell(cells, index);
    if (jCell) {
        return jCell.value;
    }
    return "";
}
