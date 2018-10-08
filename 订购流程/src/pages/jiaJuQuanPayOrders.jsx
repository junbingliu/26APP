//#import Util.js
//#import order.js
//#import payment.js
//#import template-native.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import realPayRec.js
//#import login.js

;(function () {
    var orderIds = $.params["orderIds"];
    var useJiaJuQuanMoney = $.params["useMoney"];
    var payi = "payi_160";
    var mode = $.params["mode"];
    var bankCode = $.params["bankCode"];
    var uid = LoginService.getFrontendUserId();

//生成real external payrec
//针对payrec进行支付

    var orderIdArray = orderIds.split(",");
    var allOrderPayRecs = [];
    var payingRecs = [];
    var effectivePayRecs = [];
    var orderAliasCodes = [];

    var now = (new Date()).getTime();
    var orders = [];
    var ordersCache = {};
    for (var i = 0; i < orderIdArray.length; i++) {
        var orderId = orderIdArray[i];
        var order = OrderService.getOrder(orderId);

        var orderType = order.orderType;

        if (order.buyerInfo.userId != uid) {
            return;
        }
        var payState = order.states.payState && order.states.payState.state;//支付状态
        var processState = order.states.processState && order.states.processState.state;//处理状态
        //这里需要判断订单是否已支付成功，是否已取消状态
        if (payState == 'p201') {
            var pageData = {
                state: 'err',
                msg: "订单:" + order.aliasCode + ",已支付成功，不需要再次支付！"
            };
            out.print(JSON.stringify(pageData));
            return;
        }
        if (processState == 'p111') {
            var pageData = {
                state: 'err',
                msg: "订单:" + order.aliasCode + ",已经取消，不能支付！"
            };
            out.print(JSON.stringify(pageData));
            return;
        }
        orders.push(order);
        ordersCache[orderId] = order;
        orderAliasCodes.push(order.aliasCode);
        var payRecs = order.payRecs;
        for (var j in payRecs) {
            var payRec = payRecs[j];
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
        var pageData = {
            state: 'err',
            payingRecs: payingRecs,
            msg: "您的订单刚刚提交了支付，为了防止您重复支付，请过5分钟后再试。"
        };
        if (mode == 'json') {
            out.print(JSON.stringify(pageData));
            return;
        }
        var templateSource = $.getProgram(appMd5, "pages/addOrderErr.html");
        var pageFn = template.compile(templateSource);
        out.print(pageFn(pageData));
    }
    else {
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

        //针对支付到平台的订单，进行合并支付
        var payToPlatformPayments = PaymentService.getMerchantThirdPartPaymentsByOrderType("head_merchant", "common");
        var independents = [];
        independentPayRecs.forEach(function (r) {
            var payments = PaymentService.getMerchantThirdPartPaymentsByOrderType(r.merchantId, "common");
            independents.push({payRecord: r, payments: payments, totalNeedPayAmount: Number(r.needPayMoneyAmount)});
        });

        var totalNeedPayAmount = Number(useJiaJuQuanMoney) * 100;
        //payToPlatformRecs.forEach(function (r) {
        //    totalNeedPayAmount += Number(r.needPayMoneyAmount);
        //});

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

        if (orderIds.length > 0) {
            var orderId = orderIds[0];
        }

        //创建一个RealPayRecord
        var effectiveMerchantId = "";
        var effectivePaymentId = "";
        var effectivePaymentName = "";
        var now = (new Date()).getTime();
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
                orderIds: orderIds,
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
            var payHtml = PaymentService.getPayHtml(realPayRec);

            payToPlatformRecs.forEach(function (r) {
                r.realPayRecId = id;
                r.realPayRecTime = now;
                r.paymentName = effectivePaymentName;
                r.paymentId = effectivePaymentId;
                //r.tranSerialNo = id;
                r.state = "4"; //"4"支付中
                r.payInterfaceId = payi;
                var o = ordersCache[r.orderId];
                OrderService.updateOrder(r.orderId, o, o.buyerInfo.userId);
            });

            //去支付
            var templateSource = $.getProgram(appMd5, "pages/payHandler.html");
            var pageFn = template.compile(templateSource);
            var pageData = {
                payHtml: payHtml
            };
            var html = pageFn(pageData);
            out.print(html);
        }
        else if (independents.length > 0) {
            //某个商家独立支付
            var r = independents[0];
            var effectiveMerchantId = r.payRecord.merchantId;

            r.payments.forEach(function (payment) {
                if (payment.objectMap.payInterfaceId == payi) {
                    effectivePaymentId = payment.objectMap.id;
                    effectivePaymentName = payment.objectMap.paymentName;
                }
            });
            var totalNeedPayAmount = Number(useJiaJuQuanMoney) * 100;
            var payRecordIds = independents.map(function (independent) {
                return independent.payRecord.orderId + "%" + independent.payRecord.payRecId
            });
            //independents.forEach(function (independent) {
            //    totalNeedPayAmount += Number(independent.totalNeedPayAmount);
            //});
            var realPayRec = {
                merchantId: effectiveMerchantId,
                orderIds: orderIds,
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
            var payHtml = PaymentService.getPayHtml(realPayRec);

            independents.forEach(function (r) {
                r.payRecord.realPayRecId = id;
                r.payRecord.realPayRecTime = now;
                r.payRecord.paymentName = effectivePaymentName;
                r.payRecord.paymentId = effectivePaymentId;
                //r.tranSerialNo = id;
                r.payRecord.state = "4"; //"4"支付中
                r.payRecord.payInterfaceId = payi;
                var o = ordersCache[r.payRecord.orderId];
                OrderService.updateOrder(r.payRecord.orderId, o, o.buyerInfo.userId);
            });

            //去支付
            var templateSource = $.getProgram(appMd5, "pages/payHandler.html");
            var pageFn = template.compile(templateSource);
            var pageData = {
                payHtml: payHtml
            };
            var html = pageFn(pageData);
            out.print(html);

        }
        //跳到RealPayRecord
    }
})();
