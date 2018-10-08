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
//#import NoticeTrigger.js
//#import $tryOutManage:services/tryOutManageServices.jsx
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
//#import $oleMobileApi:server/util/TryUseUtil.jsx

/**
 * 批量通过申请名单，主要读取表中的商品id，活动id，用户id
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
        var activeObj = tryOutManageServices.getById(activeId);
        if (!activeObj) {
            jLog = LogService.saveLog(jLog, "活动不存在");
            result.msg = "活动不存在";
            return;
        }
        jLog = LogService.saveLog(jLog, "试用活动名称:" + activeObj.title + ",批量导入试用审核通过名单");

        var productId = rows[1].cells[9].value;
        var productObj = ProductService.getProduct(productId);
        if (!productObj) {
            jLog = LogService.saveLog(jLog, "商品不存在");
            result.msg = "商品不存在";
            return;
        }
        var productActId = activeId + productId;
        var productObj2 = TrialProductService.getObject(productActId);
        if (!productObj2) {
            jLog = LogService.saveLog(jLog, productId + "活动商品不存在");
            result.msg = productId + "活动商品不存在";
            return;
        }
        var totalNum = productObj2.sellNum;//试用商品库存
        var successCount = searchSuccessUserCount(activeId, productId);
        if (successCount >= totalNum) {
            jLog = LogService.saveLog(jLog, "【" + activeObj.title + "】]活动中商品【" + productObj.name + "】试用审核通过名单已满,库存：" +
                totalNum + "，通过名单数:" + totalNum + "，不能再次上传");
            result.msg = "【" + activeObj.title + "】]活动中商品【" + productObj.name + "】试用审核通过名单已满,库存：" +
                totalNum + "，通过名单数:" + totalNum + "，不能再次上传";
            return;
        }

        function name1(name) {
            var checkinUserName = "";
            if (name.nickName) {
                checkinUserName = name.nickName;
            } else if (name.realName) {
                checkinUserName = name.realName;
            } else {
                checkinUserName = name.loginId;
            }
            return checkinUserName;
        }

        var repeatCount = 0;
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
                var userIds = userCell.value.trim();//会员id
                userJson[userIds] = userIds;

                var remarksCell = getCell(cells, 10);//备注
                remarksJson[userIds] = remarksCell.value;

                var productId2 = rows[j].cells[9].value;//商品id
                var activeId2 = rows[j].cells[7].value;//活动id
                if (productId != productId2 || activeId != activeId2) {
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
                    msg += "<br>第" + (j + 1) + "行被忽略，原因是：该行已经是审核通过状态";
                    jLog = LogService.saveLog(jLog, "<br>第" + (j + 1) + "行被忽略，原因是：该行已经是审核通过状态");
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
        //此对象是存储这个用户在这个活动已经中过奖了
        var activeSuccessId = "tryOutManage_success" + activeId + "_group";
        var activeSuccess = tryOutManageServices.getById(activeSuccessId);
        if (!activeSuccess) {
            activeSuccess = {
                id: activeSuccessId,
                activeSuccess: {}
            };
        }
        //此对象是存储该用户总共中过几次奖
        var successObj = tryOutManageServices.getById("tryOutManage_success_group");
        if (!successObj) {
            successObj = {
                id: "tryOutManage_success_group",
                successObj: {}
            };
        }

        if (successCount + list.length > totalNum) {
            jLog = LogService.saveLog(jLog, "【" + activeObj.title + "】]活动中商品【" + productObj.name + "】记录数量超额（库存：" +
                totalNum + "，已通过名单数加上此次上传名单数:" + (successCount + list.length) + "），请审核上传文件，修改后再上传");
            result.msg = "【" + activeObj.title + "】]活动中商品【" + productObj.name + "】记录数量超额（库存：" + totalNum +
                "，已通过名单数加上此次上传名单数:" + (successCount + list.length) + "），请审核上传文件，修改后再上传";
            return;
        }
        for (var g = 0; g < list.length; g++) {
            var item = list[g];
            var objId = TrialProductService.getObjectId(item.userId, item.activeId, item.productId);
            var obj = TrialProductService.getObject(objId);

            if (!activeSuccess.activeSuccess) {
                activeSuccess.activeSuccess = {};
            }
            if (!successObj.successObj) {
                successObj.successObj = {};
            }
            activeSuccess.activeSuccess[obj.userId] = obj.userId;
            if (!successObj.successObj[obj.userId]) {
                successObj.successObj[obj.userId] = 1;
            } else {
                var b = successObj.successObj[obj.userId] + 1;
                successObj.successObj[obj.userId] = b;
            }
            //申请状态 0没通过 1通过 2没操作过的
            if (obj && obj.state == "1") {
                totalAdd--;
                totalSkip++;
                repeatCount++;
                continue;
            }
            if (obj && obj.state != "1") {
                obj.state = "1";
                obj.controlUser = userId;
                obj.applicationTime = new Date().getTime();
                obj.remarks = remarksCell[obj.userId] || "";
                var productObjId = obj.activeId + obj.productId;
                var productObj1 = tryOutManageServices.getById(productObjId);
                var order = TryUseUtil.addTryUseOrder(obj.userId, obj.productId, obj.activeId, productObj1.cash, productObj1.integral, productObj1.unitPrice || 0);
                $.log("............order:" + JSON.stringify(order));
                //避免重复通过产生异常，或者产生订单的方法出现异常
                if (!obj.orderId) {
                    obj.orderId = order.aliasCode;
                    var user = UserService.getUser(obj.userId);
                    var label = {
                        "\\[user:name\\]": name1(user),//用户名
                        "\\[product:id\\]": obj.productId,//商品id
                        "\\[activity:id\\]": obj.activeId,//活动id
                        "\\[product:name\\]": productObj.htmlName,//商品名称
                        "messageSubType": "shopping",
                        "messagePageType": "tryUseApproval"
                    };
                    //成功申请以后就发送短信和推送App消息
                    NoticeTriggerService.send(obj.userId, "notice_56300", merchantId, label);
                }
            }
            //产生了订单才改变状态
            if (obj.orderId) {
                $.log("obj.orderId" + obj.orderId);
                var ok = TrialProductService.update(obj.id, obj);
            }

        }
        //如果已审核通过的名单总数 == 库存数，则将其余未审核的名单全部改成审核不通过
        if (totalNum == (successCount + list.length)) {
            var ids = searchUnApprovalUserCount(activeId, productId);
            if (ids.size() > 0) {
                for (var i = 0; i < ids.size(); i++) {
                    var id = ids.get(i);

                    var obj = TrialProductService.getObject(id);
                    if (obj.state == "2") {
                        obj.state = "0";
                        obj.controlUser = userId;
                        obj.applicationTime = new Date().getTime();
                        obj.remarks = remarksCell[obj.userId] || "";
                        TrialProductService.update(obj.id, obj);
                    }
                }
                msg += "，已将剩余试用申请名单批量改为审核不通过，数量：" + ids.size();
                jLog = LogService.saveLog(jLog, "，已将剩余试用申请名单批量改为审核不通过，数量：" + ids.size());
            }

        }
        tryOutManageServices.addObj(activeSuccessId, activeSuccess);
        tryOutManageServices.addObj("tryOutManage_success_group", successObj);
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

function searchSuccessUserCount(activeId, productId) {
    var searchParams = {};
    searchParams.activeId = activeId;
    searchParams.productId = productId;
    searchParams.state = "1";
    var searchArgs = {
        fetchCount: 1,
        fromPath: 0
    };
    var qValues = trialProductQuery.getQuery(searchParams);
    var queryArgs = {
        mode: 'adv',
        q: qValues
    };
    searchArgs.sortFields = [{
        field: "createTime",
        type: "LONG",
        reverse: true
    }];
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result1 = SearchService.search(searchArgs);
    return result1.searchResult.getTotal();
}

function searchUnApprovalUserCount(activeId, productId) {
    var searchParams = {};
    searchParams.activeId = activeId;
    searchParams.productId = productId;
    searchParams.state = "2";
    var searchArgs = {
        fetchCount: 99999,
        fromPath: 0
    };
    var qValues = trialProductQuery.getQuery(searchParams);
    var queryArgs = {
        mode: 'adv',
        q: qValues
    };
    searchArgs.sortFields = [{
        field: "createTime",
        type: "LONG",
        reverse: true
    }];
    searchArgs.queryArgs = JSON.stringify(queryArgs);
    var result1 = SearchService.search(searchArgs);
    return result1.searchResult.getLists();
}