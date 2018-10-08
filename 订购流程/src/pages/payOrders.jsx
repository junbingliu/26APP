//#import Util.js
//#import order.js
//#import login.js
//#import payment.js
//#import session.js
//#import template-native.js
//#import $paymentSetting:services/paymentSettingService.jsx

;(function(){
    var user = LoginService.getFrontendUser();
    var userId = "";
    if(!user){
        //var requestURI = request.getRequestURI() + "";
        //response.sendRedirect("/login.html?rurl="+ encodeURI(requestURI + "?" + request.getQueryString()));
        response.sendRedirect("/");
        return;
    }
    userId = SessionService.getSessionValue("orderUserId", request) || user.id;
    var orderIds = $.params.orderIds;
    var orderIdArray = orderIds.split(",");
    var allOrderPayRecs = [];
    var payingRecs = [];
    var effectivePayRecs = [];
    var codPayRecs = [];

    var now = (new Date()).getTime();
    var orders = [];
    for(var i=0;i<orderIdArray.length;i++){
        var orderId = orderIdArray[i];
        var order = OrderService.getOrder(orderId);
        if(order.buyerInfo.userId!=userId){
            return;
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
            payRec.aliasCode = order.aliasCode;
            //在线支付
            if(payRec.payInterfaceId == 'payi_1' && (payRec.state == '4' ||payRec.state=='0')){
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
    /*out.print(JSON.stringify(effectivePayRecs));
     return;*/
    if(payingRecs.length>0){
        //如果有问题，则显示错误
        var pageData = {
            state : 'err',
            payingRecs:payingRecs
        }
        var templateSource = $.getProgram(appMd5,"pages/addOrderErr.html");
        var pageFn = template.compile(templateSource);
        out.print(pageFn(pageData));
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
        payToPlatformRecs.forEach(function(r){
            totalNeedPayAmount+= Number(r.fNeedPayMoneyAmount);
        });

        var pageData = {
            state:"ok",
            payToPlatform:{
                payToPlatformRecs:payToPlatformRecs,
                payToPlatformPayments:payToPlatformPayments,
                totalNeedPayAmount:totalNeedPayAmount,
                payToPlatformOrderIds:payToPlatformOrderIds.join(",")
            },
            independents:independents,
            codPayRecs:codPayRecs,
            orders:orders
        };

        var templateSource = $.getProgram(appMd5,"pages/payOrders.html");
        var pageFn = template.compile(templateSource);

        var html = pageFn(pageData);
        out.print(html);
    }
})();







