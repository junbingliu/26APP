//#import Util.js
//#import order.js
//#import login.js
//#import payment.js
//#import OrderUtil.js
//#import session.js
//#import DateUtil.js
//#import template-native.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import @server/util/ErrorCode.jsx

;(function () {
    var ret = ErrorCode.S0A00000;
    var user = LoginService.getFrontendUser();
    var userId = "";

    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.modules.order
    );
    var loginUserId = user.id;
    var orderUserId = SessionService.getSessionValue("sajiaoUserId", request);
    var userId = user.id;
    $.log(orderUserId);

    if (!loginUserId) {
        ret.data = {};
        ret.msg = "请登录";
        out.print(JSON.stringify(ret));
        return;
    }

    var orderIds = $.params.orderIds;
    $.log("888888888888888888888888"+orderIds)
    var orderIdArray = orderIds.split(",");

    $.log(orderIds);

    var payingRecs = [];
    var effectivePayRecs = [];
    var codPayRecs = [];

    var now = (new Date()).getTime();
    var orders = [];
    var cliseTimeMap = {}
    for (var i = 0; i < orderIdArray.length; i++) {
        var orderId = orderIdArray[i];

        var order = OrderService.getOrder(orderId);

        var javaOrder = $.toJavaJSONObject(order);
        var closeTime = selfApi.OrderSystemArgusUtil.getOrderAutoCloseTime(javaOrder)+"";
        cliseTimeMap[order.id] = closeTimeFormat(closeTime);
        var endPayTimeFormat = DateUtil.getLongDate(parseInt(order.createTime)) + "";
        order.createTimeFormat = DateUtil.getLongDate(parseInt(order.createTime)) + "";
        var itemList = selfApi.OrderHelper.getNewItemsWithChildItemsWithPresent(javaOrder);
        itemList = JSON.parse(itemList.toString());
        var items = [];
        for (var x = 0; x < itemList.length; x++) {
            var product = {};
            var name = itemList[x].name;
            product.name = name;
            items.push(product);
        }
        var buyerUserId;
        if (order.buyerInfo) {
            buyerUserId = order.buyerInfo.userId;
        }

        if ((!buyerUserId) || (buyerUserId != orderUserId && buyerUserId != loginUserId)) {
            $.log("buyerUserId!=userId,buyerUserId:" + buyerUserId + ",orderUserId=" + orderUserId);
            ret.data = {};
            ret.msg = "buyerUserId!=userId,buyerUserId:" + buyerUserId + ",orderUserId=" + orderUserId
            return;
        }

        orders.push(order);
        var payRecs = order.payRecs;
        var isPayed = OrderUtilService.isPayed(order);
        for (var j in payRecs) {
            var payRec = payRecs[j];
            payRec.merchantId = order.merchantId;
            payRec.aliasCode = order.aliasCode;
            payRec.orderId = order.id;
            if (isPayed && payRec.state == '1') {
                var payInteface = PaymentService.getPayInterface(payRec.payInterfaceId);
                if (payInteface.isPayOnLine === 'Y') {
                    effectivePayRecs.push(payRec);
                    break;
                }
            }
            //在线支付
            if (payRec.payInterfaceId == 'payi_1' && (payRec.state == '4' || payRec.state == '0')) {
                effectivePayRecs.push(payRec);

            }else if ((payRec.state == '4' || payRec.state == '0')) {
                effectivePayRecs.push(payRec);
            }
            //货到付款
            if (payRec.payInterfaceId == 'payi_0' && payRec.state == '0') {
                codPayRecs.push(payRec);
            }
        }
    }


    //判断用哪个商家的payment设置来支付这个订单
    //业务逻辑应该是每个商户配置是否继承商城的配置，如果继承就不用设置了
    //就可以合并支付，如果不行就不能合并支付，就需要分别支付
    var realPayRecs = {};
    effectivePayRecs.forEach(function (payRec) {
        var inheritPlatform = PaymentSettingService.getInheritPlatform(payRec.merchantId);

        if (inheritPlatform) {
            var realPayRec = realPayRecs['head_merchant'];
            if (!realPayRec) {
                realPayRec = {
                    merchantId: 'head_merchant',
                    payRecs: [payRec],
                    aliasCodes: [payRec.aliasCode],
                    orderIds: [payRec.orderId]
                }
                realPayRecs['head_merchant'] = realPayRec;
            }
            else {
                realPayRec.payRecs.push(payRec);
                realPayRec.aliasCodes.push(payRec.aliasCode);
                realPayRec.orderIds.push(payRec.orderId);
                realPayRec.closeTime = cliseTimeMap[payRec.orderId];
            }
        }
        else {
            var realPayRec = realPayRecs[payRec.merchantId];
            if (!realPayRec) {
                realPayRec = {
                    merchantId: payRec.merchantId,
                    payRecs: [payRec],
                    aliasCodes: [payRec.aliasCode],
                    orderIds: [payRec.orderId],
                    closeTime: cliseTimeMap[payRec.orderId]
                }
                realPayRecs[payRec.merchantId] = realPayRec;
            }
            else {
                realPayRec.payRecs.push(payRec);
                realPayRec.aliasCodes.push(payRec.aliasCode);
                realPayRec.orderIds.push(payRec.orderId);
                realPayRec.closeTime = cliseTimeMap[payRec.orderId];
            }
        }
    });

    var lst = [];
    for (var merchantId in realPayRecs) {
        var realPayRec = realPayRecs[merchantId];
        var payments = PaymentService.getMerchantThirdPartPaymentsByOrderType(realPayRec.merchantId, "common");
        payments = payments.map(function (payment) {
            return {
                id: payment.objectMap.id,
                paymentName: payment.objectMap.paymentName,
                payInterfaceId: payment.objectMap.payInterfaceId,
                logoUrl: payment.objectMap.payInterface.objectMap.logoUrl,
                isMobile: payment.objectMap.payInterface.objectMap.isMobile
            }
        });
        realPayRec.payments = payments;
        var total = 0;
        realPayRec.payRecs.forEach(function (r) {
            total += Number(r.fNeedPayMoneyAmount);
        });
        realPayRec.total = total;
        realPayRec.items = items
        lst.push(realPayRec);
    }


    var codAliasCodes = [];
    codPayRecs.forEach(function (payRec) {
        codAliasCodes.push(payRec.aliasCode);
    });



    var rets = {
        state: "ok",
        realPayRecs: lst,
        codAliasCodes: codAliasCodes,
    }


    ret.data = rets;
    ret.msg = "获取订单支付成功";
    out.print(JSON.stringify(ret));

})();


function closeTimeFormat(closeTime){
    closeTime = closeTime * 1000;
    var ss = 1000;
    var mi = ss * 60;
    var hh = mi * 60;
    var dd = hh * 24;

    var day = Math.floor(closeTime / dd);
    var hour = Math.floor(closeTime % dd / hh);
    var minute = Math.floor(closeTime % hh / mi);
    var second = Math.floor(closeTime % hh % mi);
    var result = "";
    if(day > 0) {
        result += day+"天";
    }
    if(hour > 0) {
        result += hour+"小时";
    }
    if(minute > 0) {
        result += minute+"分";
    }
    if(second > 0) {
        result += second+"秒";
    }
    return result;
}




