//#import Util.js
//#import HttpUtil.js
//#import doT.min.js
//#import open-order.js
//#import order.js
//#import OrderLog.js
//#import product.js
//#import jobs.js
//#import DateUtil.js
//#import sysArgument.js
//#import @server/util/CommonUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import $sfExchangeMgr:services/sfExchangeMgrService.jsx
//#import $logisticsInfoManage:services/LogisticsInfoManageService.jsx
//#import $oleMobileApi:server/util/HttpUrlConnectUtil.jsx
/**
 * 路由查询接口支持两类查询方式
 * 1.根据顺丰运单号查 : 查询请求中提供接入编码与运单号 结算方式:月结
 * 2.根据客户订单号查询 : 查询请求中提供接入编码与订单 结算方式:现结
 * Route节点信息 {"remark":"顺丰速运 已收取快件","accept_time":"2017-07-14 09:48:55","accept_address":"深圳市","opcode":"50"}
 */
(function () {
    $.log("===============SFExpress routing,aliasCode:" + $.params.orderAliasCode);
    var t1 = (new Date()).getTime();
    var res = CommonUtil.initRes();

    //结算方式:月结(用运单号查询 tracking_type=1) 现结(订单号查询tracking_type=2)
    var settleType = SysArgumentService.getSysArgumentStringValue("head_merchant", "col_sysargument_interaction", "settleType");
    var data = {};
    var orderAliasCode = $.params.orderAliasCode || "";  //多个订单号用逗号分隔
    var spec = $.params['spec'] || "180X180";//商品图片规格
    if (!orderAliasCode) {
        CommonUtil.setErrCode(res, ErrorCode.E1M000000);
        return;
    }


    var mailnoAndOrderIds = getMailnoAndOrderIds(orderAliasCode);

    // //todo 此处只是测试用，UAT和生产需注释此段
    // var orderAliasCodes = orderAliasCode.split(",");
    // var testOrderIds=[],testAliasCode = [];
    // for (var i = 0; i < orderAliasCodes.length; i++) {
    //     var aliasCode = orderAliasCodes[i];
    //     var jOrder = OrderService.getOrderByAliasCode(aliasCode);
    //     if (!jOrder) {
    //         continue;
    //     }
    //     testAliasCode.push(aliasCode);
    //     testOrderIds.push(jOrder.id);
    // }
    // $.log("testOrderIds=="+testOrderIds[1]);
    // //此段注释到此结束


    var orderIds = {};
    if (mailnoAndOrderIds) {
        data.mailno = mailnoAndOrderIds.mailno;
        orderIds = mailnoAndOrderIds.orderIds;
    }
    $.log("mailnoAndOrderIds=" + JSON.stringify(mailnoAndOrderIds));
    if (settleType == "C") {
        data.tracking_type = 2;
        data.tracking_number = orderAliasCode;
    }
    if (settleType == "M") {
        data.tracking_type = 1;
        data.tracking_number = data.mailno;
    }

    data.method_type = $.params.method_type || "1";  //路由查询类别

    data.head = CommonUtil.getHead(); //顺丰接入编码

    var template = $.getProgram(appMd5, "template/routeTemplate.jsxp");
    var pageFn = doT.template(template);
    var xml = pageFn(data);
    // $.log("xml===" + xml);
    var verifyCode = CommonUtil.getVerifyCode(xml);
    var postData = {xml: xml, verifyCode: verifyCode};

    var pState = "";  //物流状态
    var t2 = (new Date()).getTime();
    try {
        //var returnData = HttpUtils.postByTimeout(CommonUtil.getPostUrl(), postData);
        var returnData = HttpUrlConnectUtil.postJson(CommonUtil.getPostUrl(), postData);
        $.log(".............orderAliasCode:" + orderAliasCode + ",returnData:" + returnData);
    } catch (e) {
        $.log(".............orderAliasCode:" + orderAliasCode + ",e:" + e);
        if (((e).toLowerCase().indexOf("ConnectTimeoutException".toLowerCase()) > -1) || ((e).toLowerCase().indexOf("UnknownHostException".toLowerCase()) > -1)) {
            var order = OrderService.getOrderByAliasCode(mailnoAndOrderIds.first_aliasCode);
            var extraInfos = getExtraInfo(order, spec);
            var routeInfo = defaultBuildRecord(order, "timeout");
            pState = "已发货";
            var data = {routeInfo: routeInfo, extraInfos: extraInfos, pState: pState};
            res.data = data;
            CommonUtil.setErrCode(res, ErrorCode.sfExchange.E1C00007);
            return;
        }
    }

    var t3 = (new Date()).getTime();
    // $.log("returnData==" + returnData);

    var xPath = "/Response/Head";
    var head = CommonUtil.getNodeValue(returnData, xPath);

    var logData = {};
    logData.id = mailnoAndOrderIds.first_aliasCode;
    logData.postData = postData;
    logData.opType = "route";  //日志操作类型 create,route,search
    logData.aliasCode = mailnoAndOrderIds.first_aliasCode;
    logData.merchantId = mailnoAndOrderIds.first_merchantId;
    logData.returnData = returnData;
    logData.exchangeTime = t3 - t2;

    // var logId = sfExchangeMgrService.addLog(logData);
    // $.log("logId===" + logId);


    var data = [];
    if ("OK" == head.toUpperCase()) {
        logData.status = "success";
        logData.msg = "查询路由信息成功";
        $.log("查询路由信息成功");
        xPath = "//RouteResponse";
        var result = CommonUtil.parseSFRouteXml(returnData, xPath);
        // $.log("result===" + JSON.stringify(result));
        if (!CommonUtil.isEmptyObject(result)) {
            for (var k in result) {
                var mailno = k;
                var routeInfo = result[k];
                var order = OrderService.getOrderByAliasCode(orderIds[k].aliasCode);
                var extraInfos = getExtraInfo(order, spec);

                if (CommonUtil.isEmptyObject(routeInfo)) {

                    var defaultRecord = defaultBuildRecord(order, "nothing");
                    routeInfo = defaultRecord;
                    pState = "已发货";

                } else {
                    var defaultRecord = defaultBuildRecord(order);
                    routeInfo.reverse();
                    routeInfo.push.apply(routeInfo, defaultRecord);

                    for (var i = 0; i < routeInfo.length; i++) {
                        pState = "运输中";
                        if (routeInfo[i].opcode == "80") {
                            logData.msg += ",已签收";
                            var processState = getProcessState(order);
                            pState = "已签收";
                            if (processState != "p112") {

                                var when = (new Date()).getTime() + 1000;
                                var jobPageId = "task/doSignedOMSOrder.jsx";
                                var post_data = {orderId: order.id, serviceIds: "2E150000000019", execTime: 1};
                                JobsService.submitOmsTask("omsEsb_order", jobPageId, post_data, when);

                                var signResult = OpenOrderService.signOrder(order.id, order.aliasCode);
                                if (signResult.code == "0") {
                                    logData.msg += ",订单号为[" + order.aliasCode + "]的订单成功修改为已签收状态";
                                } else {
                                    logData.msg += ",订单号为[" + order.aliasCode + "]的订单修改已签收状态失败,原因:" + signResult.msg;
                                }

                                var remark = routeInfo[i].remark || "";
                                var orderLog = getOrderLog(order.id, remark);
                                OrderLogService.addOrderLog(order.id, orderLog, "OLT116");
                            }

                            $.log(logData.msg);
                            break;
                        } else if (routeInfo[i].opcode == "70") {
                            logData.msg += ",已拒收";
                            var processState = getProcessState(order);
                            pState = "已拒收";
                            //processState != "p113" &&
                            if (!order.isSendRejec) {
                                var remark = routeInfo[i].remark || "";
                                logData.msg += ",订单号为[" + order.aliasCode + "]的订单成功已拒收,准备对接OMS";

                                //对接到OMS
                                var when = (new Date()).getTime() + 1000;
                                var jobPageId = "task/doRejectOMSOrder.jsx";
                                var post_data = {orderId: order.id, serviceIds: '2E150000000019', execTime: 1};
                                JobsService.submitOmsTask("omsEsb_order", jobPageId, post_data, when);

                                order.isSendRejec = true;   //已对接到OMS
                                var updateResult = OrderService.updateOrder(order.id, order, "u_0");
                                var orderLog = getOrderLog(order.id, remark);
                                OrderLogService.addOrderLog(order.id, orderLog, "OLT116");
                            }

                            $.log(logData.msg);
                            break;
                        } else if (routeInfo[i].opcode == "44") {
                            logData.msg += ",派送中";
                            pState = "派送中";
                            $.log("已揽件");
                            break;
                        } else if (routeInfo[i].opcode == "50") {
                            logData.msg += "已揽件";
                            $.log("已揽件");
                            break;
                        }
                    }

                    // CommonUtil.setRetData(res, routeInfo);
                }
                data.push({mailno: k, routeInfo: routeInfo, extraInfos: extraInfos, pState: pState});
            }


        } else {
            var order = OrderService.getOrderByAliasCode(mailnoAndOrderIds.first_aliasCode);
            var routeInfo = defaultBuildRecord(order, "nothing");
            var extraInfos = getExtraInfo(order, spec);
            pState = "运输中";
            data.push({
                mailno: extraInfos ? extraInfos.billNo : "",
                routeInfo: routeInfo,
                extraInfos: extraInfos,
                pState: pState
            });
        }

        logData.methodTime = (new Date()).getTime() - t1;

        var logId = sfExchangeMgrService.addLog(logData);
        $.log("logId==" + logId);

    } else {
        //查询失败,取第一个订单的图片 物流商等信息
        var order = OrderService.getOrderByAliasCode(mailnoAndOrderIds.first_aliasCode);
        var routeInfo = defaultBuildRecord(order, "nothing");
        var extraInfos = getExtraInfo(order, spec);
        pState = "运输中";
        logData.status = "failed";
        xPath = "/Response/ERROR";
        var errCode = CommonUtil.getAttrsToJSON(returnData, xPath);
        var errTex = CommonUtil.getNodeValue(returnData, xPath);
        logData.msg = "查询路由信息失败:" + errTex;
        logData.methodTime = (new Date()).getTime() - t1;
        var logId = sfExchangeMgrService.addLog(logData);
        $.log("logId==" + logId);
        data.push({
            mailno: extraInfos ? extraInfos.billNo : "",
            routeInfo: routeInfo,
            extraInfos: extraInfos,
            pState: pState
        });
        // CommonUtil.setRetData(res, data);  //todo 没有物流信息也要返回商品图片物流商电话等信息
    }

    CommonUtil.setRetData(res, data);

})();

/**
 * 通过订单号集合获取运单号集合
 * @param s
 * @returns {{mailno: string, orderIds: {}}}
 */
function getMailnoAndOrderIds(s) {
    var orderAliasCodes = s.split(",");
    var mailno = "", orderIds = {}, first_aliasCode = "", first_merchantId = "";
    var flag = false;
    for (var i = 0; i < orderAliasCodes.length; i++) {
        var aliasCode = orderAliasCodes[i];
        var jOrder = OrderService.getOrderByKey(aliasCode);
        //first_aliasCode,first_merchantId 主要用于记录日志
        if (!jOrder) {
            continue;
        }
        aliasCode = jOrder.aliasCode;
        if (!flag) {
            first_aliasCode = aliasCode;
            first_merchantId = jOrder.merchantId;
            flag = true;
        }
        //返回一个JSON对象，key为运单号，保存orderId和orderAliasCode
        var orderId = jOrder.id;
        if (jOrder.logisticsInfo && jOrder.logisticsInfo.billNo) {
            var billNo = jOrder.logisticsInfo.billNo;
            orderIds[billNo] = {orderId: orderId, aliasCode: aliasCode};
            if (i < orderAliasCodes.length - 1) {
                mailno += billNo + ",";
            } else {
                mailno += billNo;
            }

        }
    }

    return {mailno: mailno, orderIds: orderIds, first_aliasCode: first_aliasCode, first_merchantId: first_merchantId};
}

function getProcessState(order) {
    var ret = "";
    if (order && order.states && order.states.processState && order.states.processState.state) {
        ret = order.states.processState.state;
    }
    return ret;
}

/**
 * 返回物流商电话,物流商名称,商品图片等非路由节点信息
 * @param orderAliasCode
 * @returns {{}}
 */
function getExtraInfo(order, spec) {
    var ret = {};
    if (order) {
        var logisticsInfo = order.logisticsInfo;
        var delMerchantColumnId = logisticsInfo.delMerchantColumnId;
        ret.mailno = logisticsInfo.billNo;
        var platformDelivery = LogisticsInfoManageService.getPlatformDelMerchant(delMerchantColumnId);
        if (platformDelivery) {
            ret.telephone = platformDelivery.deliveryMerchantTelphone;
            ret.name = platformDelivery.deliveryMerchantName;
        }
        var items = order.items;
        if (items) {
            for (var itemId in items) {
                var jItem = items[itemId];
                var spec = spec || "180X180";
                ret.productImg = ProductService.getProductLogo(ProductService.getProduct(jItem.productId), spec, "");
                break;
            }
        }
    }

    return ret;
}

/**
 * type:"timout"(超时返回 获取物流轨迹失败) "nothing"(当接口返回数据为空时:未揽收)
 * @param jOrder
 * @param notTimeout
 * @returns {Array}
 */
function defaultBuildRecord(jOrder, type) {
    var recordList = [];
    var states = jOrder.states;
    if (!states) {
        return recordList;
    }

    var processState = states.processState;
    var payState = states.payState;

    var jRecord = {};
    // var jP101 = processState["p101"];
    // if (jP101) {
    //     jRecord = {};
    //     jRecord.accept_time = DateUtil.getLongDate(Number(jP101.lastModifyTime));
    //     jRecord.remark = "订单确认";
    //     recordList.push(jRecord);
    // }

    var jP201 = payState["p201"];
    if (jP201) {
        jRecord = {};
        jRecord.accept_time = DateUtil.getLongDate(Number(jP201.lastModifyTime));
        jRecord.remark = "已支付";
        recordList.push(jRecord);
    }

    var jP102 = processState["p102"];
    if (jP102) {
        jRecord = {};
        jRecord.accept_time = DateUtil.getLongDate(Number(jP102.lastModifyTime));
        jRecord.remark = "已出库";
        recordList.unshift(jRecord);
    }

    if (type) {
        jRecord = {};
        if (type == "timout") {
            jRecord.accept_time = "";
            jRecord.remark = "获取物流轨迹失败,请稍后重试";
            jRecord.opcode = "-1";
        }
        if (type == "nothing") {
            jRecord.accept_time = "";
            jRecord.remark = "未揽收,等待物流公司揽收";
            jRecord.opcode = "-2";
        }
        recordList.unshift(jRecord);
    }


    // var jP112 = processState["p112"];
    // if (jP112) {
    //     jRecord = {};
    //     jRecord.accept_time = DateUtil.getLongDate(Number(jP112.lastModifyTime));
    //     jRecord.remark = "已签收";
    //     recordList.unshift(jRecord);
    // }
    var jP111 = processState["p111"];
    if (jP111) {
        jRecord = {};
        jRecord.accept_time = DateUtil.getLongDate(Number(jP111.lastModifyTime));
        jRecord.remark = "已取消";
        recordList.unshift(jRecord);
    }

    return recordList;
}

function getOrderLog(orderId, remark) {
    var log = {};
    log.ip = "系统IP";//可以写死
    log.userId = "u_sys";//修改人ID,系统
    log.realName = "系统";//修改人名称
    log.time = new Date().getTime() + "";//修改时间
    log.description = "OMS系统对接" + orderId + "订单拒收状态";//描述
    log.oldValue = "";//旧状态名称
    log.newValue = remark;//新状态名称

    return log;
}