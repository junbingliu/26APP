//#import Util.js
//#import card.js
//#import user.js
//#import excel.js
//#import log.js
//#import order.js
//#import address.js
//#import sysArgument.js
//#import $oleUserBatchMerge:services/OleUserBatchMergeService.jsx
;
(function () {
        try {
            if (!filePath || filePath == "") {
                $.log("BatchUpdateTask.jsx....数据包文件上传失败或者获取失败");
                return;
            }
            var logInfo;
            var totalSuccess = 0;
            var totalFailed = 0;
            var beginTime = (new Date()).getTime();
            var jLog = LogService.getNewInitLog(merchantId, userId, "doOleUserBatchMergeFromExcelLog");
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
            logInfo = "【批量添加】导入文件地址：<a href='" + filePath + "' target='_blank'>" + filePath + "</a>";
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


            var oriCache = {};
            var targetCache = {};

            for (var j = beginLine - 1; j < endLine; j++) {

                try {
                    var row = rows[j];
                    var cells = row.cells;
                    var oriUserId = getCellValue(cells, findOriUserIdIndex);
                    var targetUserId = getCellValue(cells, findTargetUserIdIndex);
                    var mergeType = getCellValue(cells, findMergeTypeIndex);

                    if (oriUserId == "" && targetUserId == "" && mergeType == "") {
                        logInfo = "第[" + (j + 1) + "]行 " + "合并终止，原因是：当前行为空行";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }

                    var oriFlag = oriCache[oriUserId];
                    if (oriFlag) {
                        logInfo = "第[" + (j + 1) + "]行 " + "合并终止，原因是：当前行与第【" + oriFlag + "】行的原账号重复";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }
                    oriCache[oriUserId] = (j + 1);

                    var targetFlag = oriCache[targetUserId];
                    if (targetFlag) {
                        logInfo = "第[" + (j + 1) + "]行 " + "合并终止，原因是：当前行与第【" + targetFlag + "】行的目标账号重复";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                        continue;
                    }
                    oriCache[targetUserId] = (j + 1);

                    if (mergeType == "合并所有资料") {
                        var mergeResult = doMergeUser(findType, oriUserId, targetUserId, true);
                        if (mergeResult.code != "0") {
                            logInfo = "第[" + (j + 1) + "]行 " + "合并失败，原因是：" + mergeResult.msg;
                            jLog = LogService.saveLog(jLog, logInfo);
                            totalFailed++;
                            continue;
                        }

                        logInfo = "第[" + (j + 1) + "]行 " + "合并成功。" + mergeResult.exMsg;
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalSuccess++;
                    } else if (mergeType == "只合并动态数据") {
                        var mergeResult = doMergeUser(oriUserId, targetUserId, false);
                        if (mergeResult.code != "0") {
                            logInfo = "第[" + j + "]行 " + "合并失败，原因是：" + mergeResult.msg;
                            jLog = LogService.saveLog(jLog, logInfo);
                            totalFailed++;
                            continue;
                        }

                        logInfo = "第[" + (j + 1) + "]行 " + "合并成功。" + mergeResult.exMsg;
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalSuccess++;
                    } else {
                        logInfo = "第[" + (j + 1) + "]行 " + "合并终止，原因是：操作类型【" + mergeType + "】不合法，只能是【合并所有资料 或者 只合并动态数据】";
                        jLog = LogService.saveLog(jLog, logInfo);
                        totalFailed++;
                    }

                }
                catch (e) {
                    totalFailed++;
                    logInfo = "第" + (j + 1) + "行 导入失败，失败原因：" + e;
                    jLog = LogService.saveLog(jLog, logInfo);
                }
            }

        }
        catch (e) {
            $.log("BatchUpdateTask.jsx....操作出现异常:" + e);
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

/**
 * 合并
 * @param findType
 * @param oriUserId
 * @param targetUserId
 * @param isNeedMergeBaseInfo
 */
function doMergeUser(findType, oriUserId, targetUserId, isNeedMergeBaseInfo) {
    if (oriUserId == targetUserId) {
        return {code: "200", msg: "原账号和目标账号相同"};
    }

    var jOriUser;
    var jTargetUser;
    if (findType == "mobile") {
        jOriUser = UserService.getUserByKey(oriUserId);
        if (!jOriUser) {
            return {code: "201", msg: "手机号码为【" + oriUserId + "】的原账号不存在"};
        }

        jTargetUser = UserService.getUserByKey(targetUserId);
        if (!jTargetUser) {
            return {code: "202", msg: "手机号码为【" + targetUserId + "】的目标账号不存在"};
        }
    } else {
        jOriUser = UserService.getUser(oriUserId);
        if (!jOriUser) {
            return {code: "201", msg: "ID为【" + oriUserId + "】的原账号不存在"};
        }

        jTargetUser = UserService.getUser(targetUserId);
        if (!jTargetUser) {
            return {code: "202", msg: "ID为【" + targetUserId + "】的目标账号不存在"};
        }
    }


    var oriChannel = getChannel(jOriUser);
    var targetChannel = getChannel(jTargetUser);
    if (!oriChannel || !targetChannel || oriChannel !== targetChannel) {
        return {code: "203", msg: "待合并的两个用户渠道来源不一样"};
    }

    if (!isCanMerge(jOriUser.memberid, jTargetUser.memberid)) {
        return {code: "204", msg: "待合并的两个用户绑定了两张不一样的会员卡，需解绑其中一张卡后才能进行合并"};
    }

    var exMsg = "";
    //合并会员所属组
    if (!jTargetUser.ole_hasMergedGroups) {
        var oriMemberGroups = jOriUser.memberGroups;
        var tMemberGroups = jOriUser.memberGroups;
        if (oriMemberGroups) {
            for (var key in oriMemberGroups) {
                if (!tMemberGroups[key]) {
                    tMemberGroups[key] = oriMemberGroups[key];
                }
            }

            jTargetUser["ole_hasMergedGroups"] = true;
            exMsg = appendExMsg(exMsg, "会员组【合并成功】");
        } else {
            exMsg = appendExMsg(exMsg, "会员组【原账号没有会员组信息，无需合并】");
        }
    } else {
        exMsg = appendExMsg(exMsg, "会员组【已合并过】");
    }

    //合并订单信息
    if (!jTargetUser.ole_hasMergeOrders) {
        var orderColumnId = "c_o_u_1000";
        var orderListType = "all";
        var allOrderList = OrderApi.IsoneOrderEngine.orderService.getList(oriUserId, orderColumnId + "_" + orderListType);
        if (allOrderList && allOrderList.getSize() > 0) {
            var sloList = allOrderList.getRange(0, -1);
            for (var i = 0; i < sloList.size(); i++) {
                var slo = sloList.get(i);
                var orderId = slo.getObjid() + "";

                var jOrder = OrderService.getOrder(orderId);
                if (!jOrder) {
                    continue;
                }
                var lCreateTime = jOrder.createTime;
                var buyerInfo = jOrder.buyerInfo;

                buyerInfo.oldUserId = oriUserId;
                buyerInfo.userId = targetUserId;
                buyerInfo.lastModifyUserId = targetUserId;
                buyerInfo.loginId = jTargetUser.loginId || "";
                buyerInfo.realName = jTargetUser.realName || "";

                OleUserBatchMergeService.saveOrder(jOrder);

                OrderApi.IsoneOrderEngine.orderService.deleteFromList(orderId, lCreateTime, oriUserId, orderColumnId, orderListType);
                OrderApi.IsoneOrderEngine.orderService.add2List(orderId, lCreateTime, targetUserId, orderColumnId, orderListType);

                OrderApi.IsoneOrderEngine.orderService.addIndexingQue(orderId);
            }

            jTargetUser["ole_hasMergeOrders"] = true;
            exMsg = appendExMsg(exMsg, "订单信息【合并成功】");
        } else {
            exMsg = appendExMsg(exMsg, "订单信息【原账号没有订单信息，无需合并】");
        }
    } else {
        exMsg = appendExMsg(exMsg, "订单信息【已合并过】");
    }

    //卡券信息
    if (!jTargetUser.ole_hasMergeCard) {
        var innerTypeId = "cardType_coupons";
        var mobileSortList = CardApi.IsoneModulesEngine.cardService.getUserCardList(oriUserId, "cardType_coupons");
        var loginSortList = CardApi.IsoneModulesEngine.cardService.getUserCardList(targetUserId, innerTypeId);
        var sloList = mobileSortList.getRange(0, -1);
        if (sloList.size() > 0) {
            for (var i = 0; i < sloList.size(); i++) {
                var slo = sloList.get(i);
                var cardId = slo.getObjid() + "";

                var jCard = CardService.getCard(cardId);
                if (!jCard) {
                    continue;
                }

                var time = jCard.boundTime;
                if (!time) {
                    time = jCard.createTime;
                }

                var sobj = new OrderApi.SortListObject();
                sobj.setObjid(cardId);
                sobj.setKey(OleUserBatchMergeService.getKeyByRevertCreateTime(time / 1000, 10));

                jCard.oldBoundUserId = oriUserId;
                jCard.oldBoundUserId = targetUserId;

                OleUserBatchMergeService.saveCard(jCard);

                loginSortList.add(sobj);
                mobileSortList.delete(sobj);

                CardApi.IsoneModulesEngine.cardService.addIndexingQue(cardId);
            }

            jTargetUser["ole_hasMergeCard"] = true;
            exMsg = appendExMsg(exMsg, "卡券信息【合并成功】");
        } else {
            exMsg = appendExMsg(exMsg, "卡券信息【原账号没有卡券信息，无需合并】");
        }
    } else {
        exMsg = appendExMsg(exMsg, "卡券信息【已合并过】");
    }

    //合并收货地址
    if (!jTargetUser.ole_hasMergeAddress) {
        var jDeliveryAddress = AddressApi.IsoneModulesEngine.deliveryAddressService.getDeliveryAddress(oriUserId);
        if (jDeliveryAddress) {
            var jOriDefaultAddress = JSON.parse("" + jDeliveryAddress.toString());
            if (jOriDefaultAddress && jOriDefaultAddress.addresses) {
                var jTargetDefaultAddress = AddressService.getDefaultAddress(targetUserId);
                if (!jTargetDefaultAddress) {
                    jTargetDefaultAddress = {};
                }

                var tAddressesList = jTargetDefaultAddress.addresses;
                if (!tAddressesList) {
                    tAddressesList = {};
                    jTargetDefaultAddress.addresses = tAddressesList;
                }
                var oriAddressesList = jOriDefaultAddress.addresses;
                for (var key in oriAddressesList) {
                    tAddressesList[key] = oriAddressesList[key];
                }

                if (!jTargetDefaultAddress.id) {
                    jTargetDefaultAddress.id = targetUserId + "_deliveryAddress";
                }
                OleUserBatchMergeService.saveAddress(jTargetDefaultAddress);

                jTargetUser["ole_hasMergeAddress"] = true;
                exMsg = appendExMsg(exMsg, "收货地址【合并成功】");
            } else {
                exMsg = appendExMsg(exMsg, "收货地址【原账号没有收货地址，无需合并】");
            }
        } else {
            exMsg = appendExMsg(exMsg, "收货地址【原账号没有收货地址，无需合并】");
        }
    } else {
        exMsg = appendExMsg(exMsg, "收货地址【已合并过】");
    }

    if (isNeedMergeBaseInfo) {
        //合并用户基本信息
        if (!jTargetUser.ole_hasMergeBaseInfo) {
            copyUserValue(jOriUser, jTargetUser, "realName");
            copyUserValue(jOriUser, jTargetUser, "nickName");
            copyUserValue(jOriUser, jTargetUser, "education");
            copyUserValue(jOriUser, jTargetUser, "postalCode");
            copyUserValue(jOriUser, jTargetUser, "description");
            copyUserValue(jOriUser, jTargetUser, "income");
            copyUserValue(jOriUser, jTargetUser, "gender");
            copyUserValue(jOriUser, jTargetUser, "industry");
            copyUserValue(jOriUser, jTargetUser, "logo");
            copyUserValue(jOriUser, jTargetUser, "pigeonFileId");
            copyUserValue(jOriUser, jTargetUser, "officePhone");
            copyUserValue(jOriUser, jTargetUser, "address");

            jTargetUser["ole_hasMergeBaseInfo"] = true;
            exMsg = appendExMsg(exMsg, "用户基本信息【合并成功】");
        } else {
            exMsg = appendExMsg(exMsg, "用户基本信息【已合并过】");
        }

        jOriUser.isEnable = "0";//原账号冻结
        OleUserBatchMergeService.saveUser(jOriUser);
        OleUserBatchMergeService.saveUser(jTargetUser);
    }

    var result = {};
    result.code = "0";
    result.msg = "合并完成";
    result.exMsg = exMsg;
    return result;
}


function isCanMerge(memberId1, memberId2) {
    if (!memberId1 || !memberId2 || memberId1 === "0" || memberId2 === "0") {
        return true;
    }
    if (memberId1 === memberId2) {
        return true;
    }
    return false;
}

function getChannel(jUser) {
    var channel = jUser.channel;
    if (channel && channel["ole"]) {
        return "ole";
    } else if (channel && channel["ewj"]) {
        return "ewj";
    }
    return ""
}

function copyUserValue(oriUser, targetUser, key) {
    var value = oriUser[key];
    if (value) {
        targetUser[key] = value;
    }
}

function appendExMsg(msg, s) {
    if (msg && msg !== "") {
        return msg + ";" + s;
    }
    return s;
}