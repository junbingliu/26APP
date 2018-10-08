//#import Util.js
//#import order.js
//#import login.js
//#import payment.js
//#import PreSale.js
//#import realPayRec.js
//#import @server/util/ErrorCode.jsx
//#import $paymentSetting:services/paymentSettingService.jsx

;(function () {
    function getAppPayData(realPayRecord) {
        //payi_132 支付宝 sdk,payi_129 微信app,payi_235 银联全渠道支付
        if (realPayRecord.payInterfaceId != "payi_132" && realPayRecord.payInterfaceId != "payi_129" && realPayRecord.payInterfaceId != "payi_235")
            return "err";
        return PaymentService.getAppData(realPayRecord);
    }

    var ret = ErrorCode.S0A00000;

    var orderIds = $.params["orderIds"];
    var payi = $.params["payId"];
    var bankCode = $.params["bankCode"];
    var uid = LoginService.getFrontendUserId();

    if (!uid) {
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    if (!orderIds || !payi) {
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }

    //生成real external payrec
    //针对payrec进行支付
    var orderIdArray = orderIds.split(",");
    var orderInnerIds = [];
    var payingRecs = [];
    var effectivePayRecs = [];
    var orderAliasCodes = [];

    var now = (new Date()).getTime();
    var orders = [];
    var ordersCache = {};
    for (var i = 0; i < orderIdArray.length; i++) {
        var orderId = orderIdArray[i];
        try {
            var order = OrderService.getOrderByKey(orderId);
            if (!order) {
                ret = ErrorCode.order.E1M01003;
                out.print(JSON.stringify(ret));
                return;
            }
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
            orderInnerIds.push(order.id);
        } catch (err) {
            $.error("获取订单支付签名失败:" + err);
            ret = ErrorCode.order.E1M01003;
            out.print(JSON.stringify(ret));
            return;
        }
        var orderType = order.orderType;

        if (order.buyerInfo.userId != uid) {
            ret = ErrorCode.order.E1M01004;
            out.print(JSON.stringify(ret));
            return;
        }

        orders.push(order);
        ordersCache[order.aliasCode] = order;
        orderAliasCodes.push(order.aliasCode);
        var payRecs = order.payRecs;
        for (var j in payRecs) {
            var payRec = payRecs[j];
            payRec.orderAliasCode = order.aliasCode;
            payRec.merchantId = order.merchantId;
            if (orderType != "virtual") {
                if (payRec.payInterfaceId == 'payi_1' && (payRec.state == '4' || payRec.state == '0')) {
                    effectivePayRecs.push(payRec);
                }
                if (payRec.realPayRecId && (payRec.state == '4' || payRec.state == '0')) {
                    //TODO:zxy,目前只是再次去支付，以后是否可以判断是否已经支付成功，已经提交到支付网关等条件。
                    effectivePayRecs.push(payRec);
                }
            } else {
                effectivePayRecs.push(payRec);
            }
        }
    }

    if (payingRecs.length > 0) {
        //如果有问题，则显示错误
        ret = ErrorCode.order.E1M01005;
        ret.msg = "您的订单刚刚提交了支付，为了防止您重复支付，请过5分钟后再试。";
        out.print(JSON.stringify(ret));
        return;
    } else {
        //判断用哪个商家的payment设置来支付这个订单
        //业务逻辑应该是每个商户配置是否继承商城的配置，如果继承就不用设置了
        //就可以合并支付，如果不行就不能合并支付，就需要分别支付
        var payToPlatformRecs = [];
        var payToPlatformOrderIds = [];
        var independentPayRecs = [];
        effectivePayRecs.forEach(function (payRec) {
            var inheritPlatform = PaymentSettingService.getInheritPlatform(payRec.merchantId);
            if (inheritPlatform) {
                payToPlatformRecs.push(payRec);
                payToPlatformOrderIds.push(payRec.orderId);
            }
            else {
                independentPayRecs.push(payRec);
            }
        });

        var nowTime = (new Date()).getTime();
        //预售订单....begin
        var jOrder = orders[0];
        var isPreSaleOrder = false;
        var isDepositTime = false;
        var isBalancePayTime = false;
        var preSaleType = '';
        if (jOrder) {
            if (jOrder.orderType == "preSale") {
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
        }

        if (isDepositTime) {
            var depositHasPay = PreSaleService.isPayDeposit(jOrder.aliasCode);
            if (depositHasPay) {
                //如果当前时间是支付定金时间，并且定金已经支付，则待支付金额设置为0
                ret = ErrorCode.order.E1M01022;
                out.print(JSON.stringify(ret));
                return;
            }

            payToPlatformRecs.forEach(function (r) {
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


        //针对支付到平台的订单，进行合并支付
        var payToPlatformPayments = PaymentService.getMerchantThirdPartPaymentsByOrderType("head_merchant", "common");
        var independents = [];
        independentPayRecs.forEach(function (r) {
            var payments = PaymentService.getMerchantThirdPartPaymentsByOrderType(r.merchantId, "common");
            independents.push({payRecord: r, payments: payments, totalNeedPayAmount: Number(r.needPayMoneyAmount)});
        });

        var totalNeedPayAmount = 0;
        payToPlatformRecs.forEach(function (r) {
            totalNeedPayAmount += Number(r.needPayMoneyAmount);
        });

        var pageData = {
            state: "ok",
            payToPlatform: {
                payToPlatformRecs: payToPlatformRecs,
                payToPlatformPayments: payToPlatformPayments,
                totalNeedPayAmount: totalNeedPayAmount,
                payToPlatformOrderIds: payToPlatformOrderIds.join(",")
            },
            independents: independents,
            orders: orders
        };

        //创建一个RealPayRecord
        var effectiveMerchantId = "";
        var effectivePaymentId = "";
        var effectivePaymentName = "";
        if (payToPlatformRecs.length > 0) {
            effectiveMerchantId = "head_merchant";
            payToPlatformPayments.forEach(function (payment) {
                if (payment.objectMap.payInterfaceId == payi) {
                    effectivePaymentId = payment.objectMap.id;
                    effectivePaymentName = payment.objectMap.paymentName;
                }
            });
            var payRecordIds = payToPlatformRecs.map(function (rec) {
                return rec.orderId + "%" + rec.payRecId;
            });
            var realPayRec = {
                merchantId: effectiveMerchantId,
                orderIds: orderInnerIds.join(","),
                orderAliasCodes: orderAliasCodes.join(","),
                needPayMoneyAmount: pageData.payToPlatform.totalNeedPayAmount,
                payRecordIds: payRecordIds.join(","),
                createTime: now,
                lastModifyTime: now,
                payState: "uncertain",
                payInterfaceId: payi,
                integralPoints: 0,
                integralMoneyRatio: 0,
                paymentName: effectivePaymentName,
                paymentId: effectivePaymentId,
                ip: $.getClientIp(),
                bankCode: bankCode || "",
                userId: uid || ""
            };
            var id = RealPayRecordService.addRealPayRecord(realPayRec);
            realPayRec.id = id;
            var payData = getAppPayData(realPayRec);
            if (payData == 'err') {
                ret = ErrorCode.order.E1M01021;
                out.print(JSON.stringify(ret));
                return;
            }
            var payDataObj = JSON.parse(payData + "");
            if (payDataObj.state != 'ok') {
                ret = ErrorCode.order.E1M01021;
                ret.msg = payDataObj.msg;
                out.print(JSON.stringify(ret));
                return;
            }
            payToPlatformRecs.forEach(function (r) {
                r.realPayRecId = id;
                r.realPayRecTime = now;
                r.paymentName = effectivePaymentName;
                r.paymentId = effectivePaymentId;
                //r.tranSerialNo = id;
                r.state = "4"; //"4"支付中
                r.payInterfaceId = payi;
                var o = ordersCache[r.orderAliasCode];
                OrderService.updateOrder(r.orderId, o, o.buyerInfo.userId);
            });
            ret.data = {
                paySign: payDataObj.jPayInfo,
                androidPayInfo: payDataObj.androidPayInfo
            };
            out.print(JSON.stringify(ret));
        } else if (independents.length > 0) {
            //某个商家独立支付
            var r = independents[0];
            var effectiveMerchantId = r.payRecord.merchantId;

            r.payments.forEach(function (payment) {
                if (payment.objectMap.payInterfaceId == payi) {
                    effectivePaymentId = payment.objectMap.id;
                    effectivePaymentName = payment.objectMap.paymentName;
                }
            });
            var totalNeedPayAmount = 0;
            var payRecordIds = independents.map(function (independent) {
                return independent.payRecord.orderId + "%" + independent.payRecord.payRecId
            });
            independents.forEach(function (independent) {
                totalNeedPayAmount += Number(independent.totalNeedPayAmount);
            });
            var realPayRec = {
                merchantId: effectiveMerchantId,
                orderIds: orderInnerIds.join(","),
                orderAliasCodes: orderAliasCodes.join(","),
                needPayMoneyAmount: totalNeedPayAmount,
                payRecordIds: payRecordIds.join(","),
                createTime: now,
                lastModifyTime: now,
                payState: "uncertain",
                payInterfaceId: payi,
                integralPoints: 0,
                integralMoneyRatio: 0,
                paymentName: effectivePaymentName,
                paymentId: effectivePaymentId,
                ip: $.getClientIp(),
                bankCode: bankCode || "",
                userId: uid || ""
            };
            var id = RealPayRecordService.addRealPayRecord(realPayRec);
            realPayRec.id = id;

            var payData = getAppPayData(realPayRec);
            if (payData == 'err') {
                ret = ErrorCode.order.E1M01021;
                out.print(JSON.stringify(ret));
                return;
            }
            var payDataObj = JSON.parse(payData + "");
            if (payDataObj.state != 'ok') {
                ret = ErrorCode.order.E1M01021;
                ret.msg = payDataObj.msg;
                out.print(JSON.stringify(ret));
                return;
            }
            independents.forEach(function (r) {
                r.payRecord.realPayRecId = id;
                r.payRecord.realPayRecTime = now;
                r.payRecord.paymentName = effectivePaymentName;
                r.payRecord.paymentId = effectivePaymentId;
                //r.tranSerialNo = id;
                r.payRecord.state = "4"; //"4"支付中
                r.payRecord.payInterfaceId = payi;
                var o = ordersCache[r.payRecord.orderId] || ordersCache[r.payRecord.orderAliasCode];
                OrderService.updateOrder(r.payRecord.orderId, o, o.buyerInfo.userId);
            });
            ret.data = {
                paySign: payDataObj.jPayInfo,
                androidPayInfo: payDataObj.androidPayInfo
            };
            out.print(JSON.stringify(ret));
        } else {
            ret = ErrorCode.order.E1M01036;
            out.print(JSON.stringify(ret));
        }
    }
})();