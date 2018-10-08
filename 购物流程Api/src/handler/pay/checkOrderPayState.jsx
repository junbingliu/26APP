//#import Util.js
//#import order.js
//#import login.js
//#import realPayRec.js
//#import $yungou:services/yungouService.jsx

;(function () {

    var result = {};
    try {
        var user = LoginService.getFrontendUser();
        var loginUserId = user.id;
        var userId = user.id;
        if (!loginUserId) {
            result.state = "notLogin";
            out.print(JSON.stringify(result));
            return;
        }

        var payRecId = $.params.payRecId;
        var realPayRec;
        if (payRecId.indexOf("rPayRec_") > -1) {
            realPayRec = RealPayRecordService.getPayRec(payRecId);
        } else {
            realPayRec = RealPayRecordService.getPayRecByOuterId(payRecId);
        }
        if (!realPayRec) {
            $.log("payRecId===" + payRecId);
            result.state = "payRecNull";
            out.print(JSON.stringify(result));
            return;
        }

        var payState = realPayRec.payState;
        var orderId = realPayRec.orderIds;
        var orderAliasCode = realPayRec.orderAliasCodes;
        var jOrder;
        var states;
        var orderPayState;
        var totalPaidPrice;
        var totalNeedPayPrice;
        var jPayResult = {};
        if (orderId.indexOf("yungou_") > -1) {
            jOrder = YunGouService.get(orderId);
            jPayResult.userId = jOrder.userId;
            var yunGou = YunGouService.get(jOrder.yunGouId);
            var selectedUserId = yunGou.selectedUserId;
            var state = yunGou.state;
            if (state === "userSelected" && selectedUserId === loginUserId && Number(yunGou.price) <= Number(yunGou.buyMoney)) {
                jPayResult.award = "true";
            }
            jPayResult.yungouId = jOrder.yunGouId;
            jPayResult.resellerId = yunGou.resellerId;
        } else {
            jOrder = OrderService.getOrder(orderId);
            states = jOrder.states;
            var processState = states.processState;
            orderPayState = states.payState;
            totalPaidPrice = getTotalPaidPrice(jOrder);
            totalNeedPayPrice = getTotalNeedPayPrice(jOrder);

            jPayResult.resellerId = getResellerId(jOrder);
        }
        var curPaidPrice = "0.00";
        if (payState == "paid") {
            curPaidPrice = (Number(realPayRec.paidMoneyAmount) / 100).toFixed(2);
        }
        jPayResult.orderId = orderId;
        jPayResult.orderAliasCode = orderAliasCode;
        jPayResult.payState = payState;
        jPayResult.orderPayState = orderPayState;
        jPayResult.curPaidPrice = curPaidPrice;
        jPayResult.totalNeedPayPrice = totalNeedPayPrice;
        jPayResult.totalPaidPrice = totalPaidPrice;

        var ret = {
            state: "ok",
            payResult: jPayResult
        };
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.log("\n..................................checkOrderPayState.jsx....error=" + e);
    }

})();

function getTotalPaidPrice(jOrder) {
    var jPriceInfo = jOrder.priceInfo;
    if (jPriceInfo) {
        return jPriceInfo.fTotalOrderPayPrice;
    }
    return "0.00";
}
function getTotalNeedPayPrice(jOrder) {
    var jPriceInfo = jOrder.priceInfo;
    if (jPriceInfo) {
        return jPriceInfo.fTotalOrderNeedPayPrice;
    }
    return "0.00";
}

function getResellerId(jOrder) {
    var result = "";
    if (jOrder.id.indexOf("yungou_") > -1) {
        return result;
    }
    var itemKeys = Object.keys(jOrder.items);
    itemKeys.forEach(function (itemKey) {
        var item = jOrder.items[itemKey];
        if (item.resellerId && item.resellerId !== "") {
            result = item.resellerId;
            return;
        }
    });
    return result;
}




