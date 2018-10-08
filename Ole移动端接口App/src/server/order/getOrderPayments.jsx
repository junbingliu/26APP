//#import Util.js
//#import order.js
//#import login.js
//#import card.js
//#import payment.js
//#import session.js
//#import PreSale.js
//#import DateUtil.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import @server/util/ErrorCode.jsx

;(function () {
    var loginUserId = LoginService.getFrontendUserId();
    var ret = ErrorCode.S0A00000;
    if (!loginUserId) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var selfApi = new JavaImporter(
        Packages.net.xinshi.isone.modules.order
    );
    var orderIds = $.params.orderIds;
    var orderIdArray = orderIds.split(",");
    var effectivePayRecs = [];
    var codPayRecs = [];

    var orders = [];
    for (var i = 0; i < orderIdArray.length; i++) {
        var orderId = orderIdArray[i];
        var order = OrderService.getOrderByKey(orderId);
        var javaOrder = $.toJavaJSONObject(order);
        if (order.states.processState.state == "p111") {
            ret = ErrorCode.order.E1M01035;
            out.print(JSON.stringify(ret));
            return;
        }
        if (order.states && order.states.payState && order.states.payState.state && order.states.payState.state == "p201") {
            ret = ErrorCode.order.E1M01002;
            out.print(JSON.stringify(ret));
            return;
        }
        //货到付款订单
        if (order.payType == "301") {
            ret = ErrorCode.order.E1M01037;
            out.print(JSON.stringify(ret));
            return;
        }
        //检查订单里的购物券状态
        var jResult = CardService.checkThirdCardStatus(order);
        if (jResult.state != "ok") {
            ret = ErrorCode.order.E1M01031;
            ret.msg = jResult.msg;
            out.print(JSON.stringify(ret));
            return;
        }
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

        if ((!buyerUserId) || (buyerUserId != loginUserId)) {
            ret = ErrorCode.order.E1M01004;
            out.print(JSON.stringify(ret));
            return;
        }

        orders.push(order);
        var payRecs = order.payRecs;
        for (var j in payRecs) {
            var payRec = payRecs[j];
            payRec.merchantId = order.sellerInfo.merId;
            payRec.aliasCode = order.aliasCode;
            payRec.orderId = order.id;

            //在线支付
            if (payRec.payInterfaceId == 'payi_1' && (payRec.state == '4' || payRec.state == '0')) {
                effectivePayRecs.push(payRec);
            } else if ((payRec.state == '4' || payRec.state == '0')) {
                effectivePayRecs.push(payRec);
            }
            //货到付款
            if (payRec.payInterfaceId == 'payi_0' && payRec.state == '0') {
                codPayRecs.push(payRec);
            }
        }

        //预售订单....begin
        var nowTime = (new Date()).getTime();
        var jOrder = orders[0];
        var isPreSaleOrder = false;
        var isDepositTime = false;
        var isBalancePayTime = false;
        var preSaleType = '';
        if (jOrder && jOrder.orderType == "preSale") {
            isPreSaleOrder = true;

            var preSaleRuleId = jOrder.preSaleRuleId;
            var preSaleRule = PreSaleService.getPreSaleRuleById(preSaleRuleId);

            var beginLongTime = preSaleRule.beginLongTime;
            var endLongTime = preSaleRule.endLongTime;
            var depositBeginLongTime = preSaleRule.depositBeginLongTime;
            var depositEndLongTime = preSaleRule.depositEndLongTime;
            preSaleType = preSaleRule.type;
            if (nowTime >= Number(depositBeginLongTime) && nowTime <= Number(depositEndLongTime)) {
                isDepositTime = true;
            }
            if (nowTime >= Number(beginLongTime) && nowTime <= Number(endLongTime)) {
                isBalancePayTime = true;
            }
        }

        if (isDepositTime) {
            var depositHasPay = PreSaleService.isPayDeposit(jOrder.aliasCode);
            if (depositHasPay) {
                //如果当前时间是支付定金时间，并且定金已经支付，则待支付金额设置为0
                ret = ErrorCode.order.E1M01022;
                out.print(JSON.stringify(ret));
                return;
            }

            effectivePayRecs.forEach(function (r) {
                //一卡通支付可能会出现部分支付的情况，所以需要减去已支付的金额
                r.needPayMoneyAmount = Number(jOrder.priceInfo.totalDepositPrice) - Number(jOrder.priceInfo.totalOrderPayPrice || "0");
                //如果是全款支付的，就取订单的待支付金额
                if (preSaleType == 3) {
                    r.needPayMoneyAmount = Number(jOrder.priceInfo.totalOrderNeedPayPrice);
                }
                r.fNeedPayMoneyAmount = (r.needPayMoneyAmount / 100).toFixed(2);
            });

        } else if (isBalancePayTime) {
            var depositHasPay = PreSaleService.isPayDeposit(jOrder.aliasCode);
            if (!depositHasPay) {
                ret = ErrorCode.order.E1M01023;
                out.print(JSON.stringify(ret));
                return;
            }
            var balanceHasPay = PreSaleService.isPayBalance(jOrder.aliasCode);
            if (balanceHasPay) {
                ret = ErrorCode.order.E1M01024;
                out.print(JSON.stringify(ret));
                return;
            }
            //如果是支付尾款时间，则直接支付完所有待支付金额，包括运费
        } else {
            if (isPreSaleOrder) {
                ret = ErrorCode.order.E1M01025;
                out.print(JSON.stringify(ret));
                return;
            }
        }
        //预售订单....end
    }


    //判断用哪个商家的payment设置来支付这个订单
    //业务逻辑应该是每个商户配置是否继承商城的配置，如果继承就不用设置了
    //就可以合并支付，如果不行就不能合并支付，就需要分别支付
    var realPayRecs = {};
    effectivePayRecs.forEach(function (payRec) {
        var inheritPlatform = PaymentSettingService.getInheritPlatform(payRec.merchantId);
        payRec = {
            merchantId: payRec.merchantId,
            aliasCode: payRec.aliasCode,
            fNeedPayMoneyAmount: payRec.fNeedPayMoneyAmount,
            stateName: payRec.stateName
        };
        if (inheritPlatform) {
            var realPayRec = realPayRecs['head_merchant'];
            if (!realPayRec) {
                realPayRec = {
                    merchantId: 'head_merchant',
                    payRecs: [payRec],
                    aliasCodes: [payRec.aliasCode]
                };
                realPayRecs['head_merchant'] = realPayRec;
            } else {
                realPayRec.payRecs.push(payRec);
                realPayRec.aliasCodes.push(payRec.aliasCode);
            }
        } else {
            var realPayRec = realPayRecs[payRec.merchantId];
            if (!realPayRec) {
                realPayRec = {
                    merchantId: payRec.merchantId,
                    payRecs: [payRec],
                    aliasCodes: [payRec.aliasCode]
                };
                realPayRecs[payRec.merchantId] = realPayRec;
            } else {
                realPayRec.payRecs.push(payRec);
                realPayRec.aliasCodes.push(payRec.aliasCode);
            }
        }
    });

    var lst = [];
    for (var merchantId in realPayRecs) {
        var realPayRec = realPayRecs[merchantId];
        var payments = PaymentService.getPaymentsForMobile(realPayRec.merchantId);
        payments = payments.map(function (payment) {
            return {
                paymentName: payment.paymentName,
                payInterfaceId: payment.payInterfaceId,
                logoUrl: payment.payInterface.logoUrl,
                isMobile: payment.payInterface.isMobile
            }
        });
        realPayRec.payments = payments;
        var total = 0;
        realPayRec.payRecs.forEach(function (r) {
            total += Number(r.fNeedPayMoneyAmount);
        });
        realPayRec.total = total.toFixed(2);
        delete realPayRec.payRecs;
        delete realPayRec.merchantId;
        lst.push(realPayRec);
    }


    var codAliasCodes = [];
    codPayRecs.forEach(function (payRec) {
        codAliasCodes.push(payRec.aliasCode);
    });
    ret.data = {
        realPayRecs: lst,
        codAliasCodes: codAliasCodes
    };
    out.print(JSON.stringify(ret));
})();







