//#import Util.js
//#import order.js
//#import payment.js
//#import realPayRec.js
//#import login.js
//#import OrderUtil.js

(function () {
    var payRec = ctx.get("realPayRec");
    var payRec = $.java2Javascript(payRec);

    var id = "" + ctx.get("id");
    if (payRec.payState != 'paid') {
        return;
    }
    $.log(id + "****************,set order to pay");
    //支付成功
    var payRecordIds = "" + payRec.payRecordIds;
    if(payRecordIds.indexOf("yungou_")==0){
        return;
    }
    var recArray = payRecordIds.split(",");
    var now = (new Date()).getTime();

    //合计订单的支付总额
    var sumTotalPrice = 0;
    var orderPayPrices = {};
    recArray.forEach(function (recId) {
        $.log("\n\n\n recId = "+recId+" \n\n\n");
        var pair = recId.split("%");
        var orderId = pair[0];
        var orderPayRecId = pair[1];
        $.log("\n\n\n orderId = "+orderId+" orderPayRecId = "+orderPayRecId+"\n\n\n");
        var order = OrderService.getOrder(orderId);

        //取这个payRecId在这个订单中的应付金额
        var totalOrderPayPrice = 0;
        var orderPayRec = order.payRecs;
        for (var k in orderPayRec) {
            if (k == orderPayRecId) {
                totalOrderPayPrice = Number(orderPayRec[k].moneyAmount);
            }
        }
        orderPayPrices[orderPayRecId] = totalOrderPayPrice;

        sumTotalPrice += Number(totalOrderPayPrice);
    });

    var sumAvgVal = 0; //分滩总额（不含最后一个订单总额，最后一个用倒逼法）
    var index = 1;
    recArray.forEach(function (recId) {
        var pair = recId.split("%");
        var orderPayRecId = pair[1];
        var orderId = pair[0];
        var order = OrderService.getOrder(orderId);

        //计算支付额的分滩
        var payPriceAvg = (Number(payRec.paidMoneyAmount) * Number(orderPayPrices[orderPayRecId]) / Number(sumTotalPrice)).toFixed(0);
        if (recArray.length == index) {//最后一个使用倒逼法
            payPriceAvg = (Number(payRec.paidMoneyAmount) - Number(sumAvgVal)).toFixed(0);
        } else {
            sumAvgVal += Number(payPriceAvg);
        }

        var oldOrderPayRec = order.payRecs[orderPayRecId];
        var orderPayRec = {};
        //如果原来订单里的支付记录已经是支付,并且原来支付记录里的realPayRecId与这次的不一样，证明是多次支付，要新增加一条支付记录
        if (oldOrderPayRec && oldOrderPayRec.state == "1" && oldOrderPayRec.realPayRecId != payRec.outerId) {
            //因为储值卡在增加订单里已经在类里加过一次，所以不需要再新增一条
            if (oldOrderPayRec.payInterfaceId != "payi_10") {
                var payRecId = OrderUtilService.generatorPayRecId(order);
                var newOrderPayRec = {};
                for (var k in oldOrderPayRec) {
                    newOrderPayRec[k] = oldOrderPayRec[k];
                }
                newOrderPayRec.payRecId = payRecId;
                newOrderPayRec.payDetails = [];

                order.payRecs[payRecId] = newOrderPayRec;
                orderPayRec = newOrderPayRec;
            } else {
                orderPayRec = oldOrderPayRec;
            }
        } else {
            orderPayRec = oldOrderPayRec;
        }
        orderPayRec.tranSerialNo = "" + payRec.bankSN;
        orderPayRec.state = "1"; //IOrderService.PAY_SUCCESS
        orderPayRec.stateName = "已支付";
        orderPayRec.payTime = payRec.paidTime;
        orderPayRec.lastModifyTime = now + "";
        orderPayRec.lastModifyUserId = "u_0";
        orderPayRec.payMoneyAmount = payPriceAvg;
        orderPayRec.fPayMoneyAmount = (payPriceAvg / 100).toFixed(2);
        orderPayRec.realPayRecId = payRec.outerId;
        orderPayRec.payInterfaceId = payRec.payInterfaceId;
        orderPayRec.paymentName = payRec.paymentName;
        orderPayRec.paymentId = payRec.paymentId;
        var payDetails = orderPayRec.payDetails || [];

        var payDetail = null;
        var isExists = false;
        for (var i = 0; i < payDetails.length; i++) {
            var oldPayDetail = payDetails[i];
            //如果这个payRecId已经生成过payDetail,那么就不能再重复生成,修改原来的
            if (oldPayDetail.realPayRecId == payRec.outerId || payRec.payInterfaceId == "payi_10") {
                payDetail = oldPayDetail;
                isExists = true;
                break;
            }
        }
        var newPayDetail = {
            paymentId: payRec.paymentId,
            paymentName: payRec.paymentName,
            payMoneyAmount: payPriceAvg,
            fPayMoneyAmount: (payPriceAvg / 100).toFixed(2),
            tranSerialNo: payRec.bankSN,//IOrderService.PAY_SUCCESS
            state: "1",
            stateName: "已支付",
            createTime: payRec.lastModifyTime + "",
            payTime: payRec.lastModifyTime + "",
            realPayRecId: payRec.outerId
        };
        if (payDetail) {
            //将新的payDetail复制到旧的payDetail
            for (var k in newPayDetail) {
                payDetail[k] = newPayDetail[k];
            }
        } else {
            payDetail = newPayDetail;
        }
        var payInterface = PaymentService.getPayInterface(payRec.payInterfaceId);
        if (payInterface) {
            if (payInterface.values && payInterface.values.lowerLimit) {
                payDetail.lowerLimit = payInterface.values.lowerLimit.defaultValue;
            }
            if (payInterface.values && payInterface.values.expenseRation) {
                payDetail.expenseRation = payInterface.values.expenseRation.defaultValue;
            }
        }
        //支付金额为0的payDetail,不需要增加,现在储值卡支付会出现重复增加的情况,在java类里加了一次之后,又在这里加了一次,第二次增加的支付金额是0
        if (payDetail.payMoneyAmount != 0 && !isExists) {
            payDetails.push(payDetail);
        }
        orderPayRec.payDetails = payDetails;
        try {
            //todo 这里先设置为0，防止把已支付金额计算两次
            if (isExists) {
                payPriceAvg = 0;
            }
            //如果是储值卡支付,流水号与其他支付方式不一致,需要转化
            if (orderPayRec.payInterfaceId == 'payi_10') {
                var bankSN = JSON.parse(payRec.bankSN + "");
                //卡号,做退款时会用到
                orderPayRec.tranSerialNo = orderPayRec.cardNumber;
                //流水号
                orderPayRec.payDetails[0].tranSerialNo = bankSN[orderPayRec.cardNumber];

            }
        } catch (e) {
            $.log(".................exception:" + e);
        }

        //记录已经支付的金额
        var priceInfo = order.priceInfo;
        var totalNeedPayPrice = Number(priceInfo.totalOrderNeedPayPrice);
        var totalOrderPayPrice = Number(priceInfo.totalOrderPayPrice);
        totalNeedPayPrice -= Number(payPriceAvg);
        if (totalNeedPayPrice < 0) {
            totalNeedPayPrice = 0;
        }
        totalOrderPayPrice += Number(payPriceAvg);
        priceInfo.totalOrderNeedPayPrice = totalNeedPayPrice;
        priceInfo.fTotalOrderNeedPayPrice = (totalNeedPayPrice / 100).toFixed(2);
        priceInfo.totalOrderPayPrice = totalOrderPayPrice;
        priceInfo.fTotalOrderPayPrice = (totalOrderPayPrice / 100).toFixed(2);
        orderPayRec.needPayMoneyAmount = 0;
        orderPayRec.fNeedPayMoneyAmount = "0";
        orderPayRec.moneyAmount = orderPayRec.payMoneyAmount;
        orderPayRec.fMoneyAmount = orderPayRec.fPayMoneyAmount;

        var userId = null;
        try {
            var userId = "" + LoginService.getBackEndLoginUserId();
        }
        catch (e) {

        }
        if (!userId) {
            userId = "u_0";
        }

        //检查并自动根据待支付金额添加一个在线支付的支付记录
        checkAndAutoCreatePayRec(order);

        OrderService.updateOrder(orderId, order, userId);
        order = OrderService.getOrder(orderId);
        OrderService.doOrderStateAutoDeal(null, order, userId, "支付成功，自动修改订单状态。");
        index++;
    });
})();

function checkAndAutoCreatePayRec(jOrder) {
    var payRecs = jOrder.payRecs;
    var totalPayMoneyAmount = 0;
    var payType = jOrder.payType;
    if (payType != "300") {
        //只针对在线支付的订单处理
        return;
    }
    var priceInfo = jOrder.priceInfo;
    var totalOrderRealPrice = Number(priceInfo.totalOrderRealPrice);
    var totalOrderNeedPayPrice = priceInfo.totalOrderNeedPayPrice;
    var fTotalOrderNeedPayPrice = priceInfo.fTotalOrderNeedPayPrice;
    for (var k in payRecs) {
        totalPayMoneyAmount += Number(payRecs[k].moneyAmount);
    }

    if (totalPayMoneyAmount < totalOrderRealPrice) {
        //当支付记录的需支付金额小于订单总金额的时候，需要自动生成一个在线支付记录
        var payRecId = OrderUtilService.generatorPayRecId(jOrder);
        var now = (new Date()).getTime();
        var orderPayRec = {};
        orderPayRec.payRecId = payRecId;
        orderPayRec.orderId = jOrder.id;
        orderPayRec.orderAliasCode = jOrder.aliasCode;
        orderPayRec.tranSerialNo = "";
        orderPayRec.state = "0";
        orderPayRec.stateName = "未支付";
        orderPayRec.lastModifyTime = now + "";
        orderPayRec.lastModifyUserId = "u_sys";
        orderPayRec.payMoneyAmount = 0;
        orderPayRec.fPayMoneyAmount = "0.00";
        orderPayRec.paymentName = "在线支付";
        orderPayRec.payInterfaceId = "payi_1";
        orderPayRec.moneyAmount = totalOrderNeedPayPrice;
        orderPayRec.fMoneyAmount = fTotalOrderNeedPayPrice;
        orderPayRec.needPayMoneyAmount = totalOrderNeedPayPrice;
        orderPayRec.fNeedPayMoneyAmount = fTotalOrderNeedPayPrice;

        payRecs[payRecId] = orderPayRec;
    }
}