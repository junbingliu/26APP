//#import Util.js
//#import user.js
//#import order.js
//#import login.js
//#import account.js
//#import payment.js
//#import OrderUtil.js
//#import realPayRec.js
//#import @server/util/ErrorCode.jsx
//#import $paymentSetting:services/paymentSettingService.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var orderId = $.params.orderId;//订单外部号
    var payAmount = $.params.payAmount;//支付金额，这里目前存放积分值吧
    var userId = LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!orderId || !payAmount) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var jOrder = OrderService.getOrderByKey(orderId);
    if (!jOrder) {
        ret = ErrorCode.order.E1M01003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (jOrder.buyerInfo.userId != userId) {
        ret = ErrorCode.order.E1M01004;
        out.print(JSON.stringify(ret));
        return;
    }
    var payState = jOrder.states.payState;
    if (payState.state != "p200") {
        ret = ErrorCode.order.E1M01024;
        out.print(JSON.stringify(ret));
        return;
    }
    if (payAmount <= 0) {
        ret = ErrorCode.order.E1M01026;
        out.print(JSON.stringify(ret));
        return;
    }
    if (jOrder.orderType != "tryuse") {
        ret = ErrorCode.order.E1M01039;
        out.print(JSON.stringify(ret));
        return;
    }
    if (jOrder.maxUseIntegral && Number(jOrder.maxUseIntegral) < Number(payAmount)) {
        ret = ErrorCode.order.E1M01038;
        out.print(JSON.stringify(ret));
        return;
    }
    //获得用户拥有的积分
    var integralBalance = 0;
    try {
        $.log("获取积分的用户ID======>"+userId);
        var jUser = UserService.getUser(userId);
        $.log("jUser===积分用户信息=====>"+JSON.stringify(jUser));
        $.log("jUser.memberid====>"+jUser.memberid);
        if (jUser.memberid && jUser.memberid != "0") {
            integralBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "shoppingIntegral");
            $.log("integralBalance====取到的积分数====>"+integralBalance);
        }
    } catch (e) {
        $.log("获取会员积分失败：" + e);
        ret = ErrorCode.user.E1B02037;
        out.print(JSON.stringify(ret));
        return;
    }
    if (integralBalance == 0) {
        ret = ErrorCode.order.E1B02038;
        out.print(JSON.stringify(ret));
        return;
    }
    var orderNeedPayPrice = jOrder.priceInfo.fTotalOrderNeedPayPrice;//待支付金额，以元为单位
    if (payAmount > orderNeedPayPrice) {
        payAmount = orderNeedPayPrice;
    }
    var integralMoneyRatio = 0 + AccountService.getIntegralMoneyRatio();
    var accountRMB = integralBalance * integralMoneyRatio;
    if (payAmount > accountRMB) {
        payAmount = accountRMB;
    }
    var jPayRecs = jOrder.payRecs;
    var unPayRec = null;
    for (var payId in jPayRecs) {
        var jPayRec = jPayRecs[payId];
        if (jPayRec.state == "0") {
            unPayRec = jPayRec;
            break;
        }
    }
    var payInterfaceId = "payi_4";
    var inheritPlatform = PaymentSettingService.getInheritPlatform(jOrder.sellerInfo.merId);
    var effectiveMerchantId = jOrder.sellerInfo.merId;
    if (inheritPlatform) {
        effectiveMerchantId = "head_merchant";
    }
    //判断订单是否支持积分支付
    var payments = PaymentService.getMerchantAllPaymentsByOrderType(effectiveMerchantId, "common");
    if (!payments) {
        ret = ErrorCode.user.E1B02051;
        out.print(JSON.stringify(ret));
        return;
    }
    var supportIntegral = false;
    payments.forEach(function (payment) {
        if (payment.objectMap.payInterfaceId == 'payi_4') {
            supportIntegral = true;
        }
    });
    if (!supportIntegral) {
        ret = ErrorCode.user.E1B02051;
        out.print(JSON.stringify(ret));
        return;
    }

    var jPayment = PaymentService.getPaymentByPayInterface(payInterfaceId, effectiveMerchantId);
    if (!unPayRec) {
        var payRecId = OrderUtilService.generatorPayRecId(jOrder);
        unPayRec = {
            "orderId": jOrder.id,
            "payMoneyAmount": 0,
            "fMoneyAmount": jOrder.priceInfo.fTotalOrderNeedPayPrice,
            "payRecId": payRecId,
            "orderAliasCode": jOrder.aliasCode,
            "payInterfaceId": payInterfaceId,
            "needPayMoneyAmount": jOrder.priceInfo.totalOrderNeedPayPrice,
            "fNeedPayMoneyAmount": jOrder.priceInfo.fTotalOrderNeedPayPrice,
            "stateName": "未支付",
            "paymentId": jPayment && jPayment.id,
            "lastModifyTime": new Date().getTime(),
            "lastModifyUserId": userId,
            "state": "0",
            "paymentName": "积分支付",
            "moneyAmount": jOrder.priceInfo.totalOrderNeedPayPrice,
            "fPayMoneyAmount": "0.00"
        };
    } else {
        unPayRec.payInterfaceId = payInterfaceId;
        unPayRec.paymentId = jPayment && jPayment.id;
    }

    function toInteger(value) {
        if (isNaN(value)) {
            return value;
        }
        return Number((Number(value) * 100).toFixed(0));
    }

    function toFix(value) {
        if (isNaN(value)) {
            return value;
        }
        return Number(value).toFixed(2);//这个方法有个时候不会四舍五入，如0.015不会四舍五入到0.02
        //return Math.round(Number(value) * Math.pow(10, 2)) / Math.pow(10, 2);
    }

    unPayRec.moneyAmount = toInteger(payAmount);
    unPayRec.fMoneyAmount = toFix(payAmount);
    unPayRec.payMoneyAmount = toInteger(payAmount);
    unPayRec.fPayMoneyAmount = toFix(payAmount);
    unPayRec.needPayMoneyAmount = 0;
    unPayRec.fNeedPayMoneyAmount = 0;
    jOrder.payRecs[unPayRec.payRecId] = unPayRec;

    var userAccountAmount = Number(payAmount / integralMoneyRatio).toFixed(0);//积分值

    var jStatus = AccountService.updateUserBalance(userId, "head_merchant", "shoppingIntegral",
        (0 - userAccountAmount), "试用订单支付:" + jOrder.aliasCode, "transationType_order", jOrder.id);
    if (!jStatus || !jStatus.state || jStatus.state == "false") {
        ret = ErrorCode.user.E1B02039;
        out.print(JSON.stringify(ret));
        return;
    }
    var now = new Date().getTime();
    if (Number(payAmount) < Number(jOrder.priceInfo.fTotalOrderNeedPayPrice)) {
        var diffAmount = Number(jOrder.priceInfo.fTotalOrderNeedPayPrice) - Number(payAmount);
        var payRec = {};
        payRec = $.copy(payRec, unPayRec);
        payRec.state = "0";
        payRec.stateName = "未支付";
        payRec.paymentName = "在线支付";
        payRec.payInterfaceId = "payi_1";
        payRec.paymentId = "";
        payRec.moneyAmount = toInteger(diffAmount);
        payRec.fMoneyAmount = toFix(diffAmount);
        payRec.payMoneyAmount = 0;
        payRec.fPayMoneyAmount = "0.00";
        payRec.needPayMoneyAmount = toInteger(diffAmount);
        payRec.fNeedPayMoneyAmount = toFix(diffAmount);
        var newPayRecId = OrderUtilService.generatorPayRecId(jOrder);
        payRec.payRecId = newPayRecId;
        jOrder.payRecs[newPayRecId] = payRec;
    }
    unPayRec.state = "1";
    unPayRec.stateName = "已支付";
    unPayRec.payTime = now;
    unPayRec.paymentName = "积分支付";
    unPayRec.tranSerialNo = jStatus.logId;
    unPayRec.payDetails = [{
        "fLowerLimit": "0.00",
        "payTime": now + "",
        "tranSerialNo": jStatus.logId,
        "payMoneyAmount": toInteger(payAmount),
        "expenseRation": 0,
        "fMoneyAmount": toFix(payAmount),
        "lowerLimit": 0,
        "payRecId": "",
        "stateName": "已支付",
        "createTime": now + "",
        "paymentId": jPayment && jPayment.id,
        "state": "1",
        "paymentName": "积分支付",
        "fPayMoneyAmount": toFix(payAmount),
        "moneyAmount": toInteger(payAmount)
    }];

    var totalOrderNeedPayPrice = jOrder.priceInfo.totalOrderNeedPayPrice - unPayRec.payMoneyAmount;
    jOrder.priceInfo.totalOrderNeedPayPrice = totalOrderNeedPayPrice;//未支付金额
    jOrder.priceInfo.fTotalOrderNeedPayPrice = toFix(totalOrderNeedPayPrice / 100);
    var totalOrderPayPrice = jOrder.priceInfo.totalOrderPayPrice + unPayRec.payMoneyAmount;
    jOrder.priceInfo.totalOrderPayPrice = totalOrderPayPrice;
    jOrder.priceInfo.fTotalOrderPayPrice = toFix(totalOrderPayPrice / 100);
    var integralPayPrice = jOrder.priceInfo.integralPayPrice + unPayRec.payMoneyAmount;
    jOrder.priceInfo.integralPayPrice = integralPayPrice;
    jOrder.priceInfo.fIntegralPayPrice = toFix(integralPayPrice / 100);

    //保存订单
    OrderService.updateOrder(jOrder.id, jOrder, userId);
    //如果订单待支付金额等于0，则修改订单状态为已支付
    if (jOrder.priceInfo.totalOrderNeedPayPrice == 0) {
        jOrder = OrderService.getOrder(jOrder.id);
        OrderService.doOrderStateAutoDeal(null, jOrder, userId, "支付成功，自动修改订单状态。");
    }

    var realPayRec = {
        merchantId: effectiveMerchantId,
        orderIds: jOrder.id,
        orderAliasCodes: jOrder.aliasCode,
        needPayMoneyAmount: toInteger(payAmount),
        paidMoneyAmount: toInteger(payAmount),
        payRecordIds: jOrder.id + "%" + unPayRec.payRecId,
        createTime: now,
        lastModifyTime: now,
        payState: "paid",
        payInterfaceId: payInterfaceId,
        integralPoints: userAccountAmount,
        integralMoneyRatio: integralMoneyRatio,
        paymentName: "积分支付",
        paymentId: jPayment && jPayment.id,
        ip: $.getClientIp(),
        bankCode: "",
        userId: userId || ""
    };
    var id = RealPayRecordService.addRealPayRecord(realPayRec);
    out.print(JSON.stringify(ret));
})();