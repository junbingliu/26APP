//#import Util.js
//#import order.js
//#import login.js
//#import product.js
//#import DateUtil.js
//#import @server/util/CartUtil.jsx
//#import @server/util/ErrorCode.jsx
//#import $logisticsInfoManage:services/LogisticsInfoManageService.jsx

(function () {
    var ret = ErrorCode.S0A00000;

    var orderId = $.params['orderId'];
    var spec = $.params['spec'] || "180X180";//商品图片规格
    if (!orderId) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var jOrder = OrderService.getOrderByKey(orderId.trim());
    if (!jOrder) {
        ret = ErrorCode.order.E1M01020;
        out.print(JSON.stringify(ret));
        return;
    }
    var buyerId = jOrder.buyerInfo.userId;
    if (buyerId != userId) {
        ret = ErrorCode.order.E1M01004;
        out.print(JSON.stringify(ret));
        return;
    }
    //其他商家使用快递100的物流信息
    ret.data = kd100LogisticsInfo(jOrder);
    var items = jOrder.items;
    if (items) {
        for (var itemId in items) {
            var jItem = items[itemId];
            ret.data.productImg = ProductService.getProductLogo(ProductService.getProduct(jItem.productId), spec, "");
            break;
        }
    }

    out.print(JSON.stringify(ret));
})();

function defaultBuildRecord(jOrder) {
    var recordList = [];
    var states = jOrder.states;
    if (!states) {
        return recordList;
    }

    jRecord = {};
    jRecord.time = DateUtil.getLongDate(Number(jOrder.createTime));
    jRecord.context = "您提交了订单，请等待系统确认";
    recordList.push(jRecord);

    var processState = states.processState;

    var jRecord = {};
    var jP101 = processState["p101"];
    if (jP101) {
        jRecord = {};
        jRecord.time = DateUtil.getLongDate(Number(jP101.lastModifyTime));
        jRecord.context = "订单确认";
        recordList.unshift(jRecord);
    }
    var jP102 = processState["p102"];
    if (jP102) {
        jRecord = {};
        jRecord.time = DateUtil.getLongDate(Number(jP102.lastModifyTime));
        jRecord.context = "已出库";
        recordList.unshift(jRecord);
    }
    var jP112 = processState["p112"];
    if (jP112) {
        jRecord = {};
        jRecord.time = DateUtil.getLongDate(Number(jP112.lastModifyTime));
        jRecord.context = "已签收";
        recordList.unshift(jRecord);
    }
    var jP111 = processState["p111"];
    if (jP111) {
        jRecord = {};
        jRecord.time = DateUtil.getLongDate(Number(jP111.lastModifyTime));
        jRecord.context = "已取消";
        recordList.unshift(jRecord);
    }

    return recordList;
}
function kd100LogisticsInfo(jOrder) {
    if (!jOrder) {
        return {};
    }
    var result = {};
    var logisticsInfo = jOrder.logisticsInfo;
    if (!logisticsInfo) {
        return {};
    }
    var billNo = logisticsInfo.billNo;
    var delMerchantColumnId = logisticsInfo.delMerchantColumnId;
    var platformDelivery = LogisticsInfoManageService.getPlatformDelMerchant(delMerchantColumnId);
    if (!platformDelivery) {
        return {};
    }
    result.billNo = billNo;
    result.telephone = platformDelivery.deliveryMerchantTelphone;
    result.name = platformDelivery.deliveryMerchantName;

    var logisticsCode = platformDelivery.values && platformDelivery.values["companyCode"] && platformDelivery.values["companyCode"].defaultValue;
    var recordList = [];
    var jTrackingInfo = LogisticsInfoManageService.getByCode(logisticsCode, billNo);
    if (!jTrackingInfo) {
        result.traces = defaultBuildRecord(jOrder);
        return result;
    }
    function getStateName(state) {
        if (state == 0) {
            return "在途中";
        } else if (state == 1) {
            return "已揽收";
        } else if (state == 2) {
            return "疑难件";
        } else if (state == 3) {
            return "已签收";
        } else if (state == 4) {
            return "退签";
        } else if (state == 5) {
            return "同城派送中";
        } else if (state == 6) {
            return "退回";
        } else if (state == 7) {
            return "转单";
        } else {
            return "配送中";
        }
    }

    result.traces = jTrackingInfo && jTrackingInfo.traces || [];
    result.state = jTrackingInfo && getStateName(jTrackingInfo.state) || "配送中";
    return result;
}