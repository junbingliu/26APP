//#import Util.js
//#import login.js
//#import message.js
//#import order.js
//#import @server/util/ErrorCode.jsx
//#import $logisticsInfoManage:services/LogisticsInfoManageService.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var msgId = $.params['id'];//消息id
    if (!msgId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var loginUserId = LoginService.getFrontendUserId();
    if (!loginUserId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var jMsg = MessageService.getMessage(msgId);
    if (!jMsg) {
        ret = ErrorCode.notify.E1M100005;
        out.print(JSON.stringify(ret));
        return;
    }
    ret.data = {
        title:jMsg.title,
        content:jMsg.content,
        sendTime:jMsg.sendTime
    };
    var readState = jMsg[loginUserId + "_read"];
    if (readState == "0") {
        MessageService.updateToHaveRead(loginUserId, msgId);
    }
    var messageSubType = jMsg.messageSubType;
    if (messageSubType == "orderShipping") {
        var targetObjId = jMsg.targetObjId;
        var jOrder = OrderService.getOrderByKey(targetObjId);
        ret.data.traces = kd100LogisticsInfo(jOrder);
    } else {
        ret.data = {};
    }
    out.print(JSON.stringify(ret));
})();

function kd100LogisticsInfo(jOrder) {
    if (!jOrder) {
        return [];
    }
    var result = {};
    var logisticsInfo = jOrder.logisticsInfo;
    if (!logisticsInfo) {
        return [];
    }
    var billNo = logisticsInfo.billNo;
    var delMerchantColumnId = logisticsInfo.delMerchantColumnId;
    var platformDelivery = LogisticsInfoManageService.getPlatformDelMerchant(delMerchantColumnId);
    if (!platformDelivery) {
        return [];
    }
    result.billNo = billNo;
    result.telephone = platformDelivery.deliveryMerchantTelphone;
    result.name = platformDelivery.deliveryMerchantName;

    var logisticsCode = platformDelivery.values && platformDelivery.values["companyCode"] && platformDelivery.values["companyCode"].defaultValue;
    var jTrackingInfo = LogisticsInfoManageService.getByCode(logisticsCode, billNo);
    if (!jTrackingInfo) {
        result.traces = defaultBuildRecord(jOrder);
        return result.traces;
    }

    result.traces = jTrackingInfo && jTrackingInfo.traces || [];
    return result.traces;
}