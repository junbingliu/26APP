//#import Util.js
//#import order.js
//#import OrderUtil.js
//#import payment.js
//#import merchant.js
//#import $paymentSetting:services/paymentSettingService.jsx
//#import sysArgument.js
//#import login.js

(function(processor){
    processor.on("all",function(pageData,dataIds,elems){
        var user = LoginService.getFrontendUser();
        var userId = "";
        if(!user){
            response.sendRedirect("/");
            return;
        }
        userId = user.id;

        var orderIds = $.params.orderIds;
        var orderIdArray = orderIds.split(",");
        var allOrderPayRecs = [];
        var payingRecs = [];
        var effectivePayRecs = [];
        var codPayRecs = [];

        var isOnlyOneOrder = false;
        var isIntegralOrder = false;//是否积分换购订单
        if(orderIdArray.length == 1){
            //只有一个订单，则根据订单对应的商家获取自动关闭时间
            isOnlyOneOrder = true;
        }

        var now = (new Date()).getTime();
        var orders = [];
        for(var i=0;i<orderIdArray.length;i++){
            var orderId = orderIdArray[i];
            var order = OrderService.getOrder(orderId);

            if(!isIntegralOrder){
                //检查是否积分换购订单，目前只要一个是积分换购，则认为是
                isIntegralOrder = OrderUtilService.isIntegralOrder(order);
            }

            var buyerUserId;
            if(order.buyerInfo){
                buyerUserId = order.buyerInfo.userId;
            }

            if((!buyerUserId) || buyerUserId != userId){
                response.sendRedirect("/");
                return;
            }
            orders.push(order);
            var payRecs = order.payRecs;
            for(var j in payRecs){
                var payRec = payRecs[j];
                payRec.merchantId = order.merchantId;
                var mer = MerchantService.getMerchant(order.merchantId);
                payRec.merchantName = mer.name || mer.name_cn;
                payRec.aliasCode = order.aliasCode;
                //在线支付
                if(payRec.payInterfaceId == 'payi_1' && (payRec.state == '4' ||payRec.state=='0') ){
                    effectivePayRecs.push(payRec);
                }
                else if(payRec.realPayRecId && (payRec.state == '4' ||payRec.state=='0')){
                    effectivePayRecs.push(payRec);
                }
                //货到付款
                if(payRec.payInterfaceId == 'payi_0' && payRec.state=='0' ){
                    codPayRecs.push(payRec);
                }
            }
        }
        if(payingRecs.length>0){
            //如果有问题，则显示错误
            var model = {
                state : 'err',
                payingRecs:payingRecs
            }
            pageData("model",model);
            return;
        }
        else{

            //判断用哪个商家的payment设置来支付这个订单
            //业务逻辑应该是每个商户配置是否继承商城的配置，如果继承就不用设置了
            //就可以合并支付，如果不行就不能合并支付，就需要分别支付
            var payToPlatformRecs = [];
            var payToPlatformOrderIds = [];
            var independentPayRecs = [];
            effectivePayRecs.forEach(function(payRec){
                var inheritPlatform = PaymentSettingService.getInheritPlatform(payRec.merchantId);
                if(inheritPlatform){
                    payToPlatformRecs.push(payRec);
                    payToPlatformOrderIds.push(payRec.orderId);
                }
                else{
                    independentPayRecs.push(payRec);
                }
            });

            //针对支付到平台的订单，进行合并支付
            var payToPlatformPayments = PaymentService.getMerchantThirdPartPaymentsByOrderType("head_merchant","common");
            var independents = [];
            independentPayRecs.forEach(function(r){
                var payments = PaymentService.getMerchantThirdPartPaymentsByOrderType(r.merchantId,"common");
                independents.push({payRecord:r,payments:payments,totalNeedPayAmount:Number(r.fNeedPayMoneyAmount)});
            });

            var totalNeedPayAmount = 0;
            var merNames = [];
            payToPlatformRecs.forEach(function(r){
                merNames.push(r.merchantName);
                totalNeedPayAmount+= Number(r.fNeedPayMoneyAmount);
            });

            //这里取普通订单关闭时间系统参数(单位是秒)
            var closeTime;
            if(isOnlyOneOrder){
                var jOneOrder = OrderService.getOrder(orderIdArray[0]);
                closeTime = OrderService.getOrderAutoCloseTime(jOneOrder);
            } else {
                closeTime = SysArgumentService.getSysArgumentStringValue("head_merchant","col_sysargument_order","orderAutoCloseTime_common");
            }
            if(closeTime){
                if(Number(closeTime) >= 3600){
                    closeTime = (Number(closeTime)/3600).toFixed(0) + "小时";//转化成小时,暂时只显示小时数
                } else {
                    closeTime = (Number(closeTime)/60).toFixed(0) + "分钟";//转化成小时,暂时只显示小时数
                }
            }

            $.log(".............................closeTime="+closeTime);
            $.log("\n\n............................666666666666666666666......isIntegralOrder="+isIntegralOrder);

            var model = {
                state:"ok",
                payToPlatform:{
                    isIntegralOrder:isIntegralOrder,
                    payToPlatformRecs:payToPlatformRecs,
                    payToPlatformPayments:payToPlatformPayments,
                    totalNeedPayAmount:totalNeedPayAmount.toFixed(2),
                    payToPlatformOrderIds:payToPlatformOrderIds.join(","),
                    merNames:merNames
                },
                independents:independents,
                codPayRecs:codPayRecs,
                orders:orders,
                closeTime:closeTime
            };

            pageData["model"] = model;
        }
    });
})(dataProcessor);







