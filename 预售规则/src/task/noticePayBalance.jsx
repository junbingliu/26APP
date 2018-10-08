//#import Util.js
//#import NoticeTrigger.js
//#import order.js
//#import user.js
//#import DateUtil.js
//#import OrderUtil.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    //var id = $.params['id'];
    //已付定金列表
    //$.log("\n.....................in notice pay balance  id:"+id+"\n");
    var preSaleOrderList = PreSaleRuleService.getPreSaleDepositPaidList(id, 0, -1);
    if(!preSaleOrderList || preSaleOrderList.length == 0){
        return;
    }
    var preSaleObj = PreSaleRuleService.getById(id);
    if (!preSaleObj) {
        return;
    }
    var nowTime = DateUtil.getNowTime();//现在时间
    var beginLongTime = preSaleObj.beginLongTime;
    //如果当前时间小于尾款开始支付时间,那么就表示还没有到尾款支付时间,不用通知用户
    if (nowTime < beginLongTime) {
        return;
    }
    //$.log("\n.....................in notice pay balance  preSaleOrderList.length:"+preSaleOrderList.length+"\n");
    var lastPayTime = preSaleObj.endTime;
    for (var i = 0; i < preSaleOrderList.length; i++) {
        var listObj = preSaleOrderList[i];
        var key = listObj.key;
        var orderId = listObj.objid;
        if (!orderId) {
            continue;
        }
        //$.log("\n.....................in notice pay balance  orderId:"+orderId+"\n");
        var order = OrderService.getOrder(orderId);
        if (!order) {
            continue;
        }
        var states = order.states;
        if (!states) {
            continue;
        }
        var processState = states.processState;
        if (processState.state == 'p111') {//已取消不用通知
            continue;
        }
        var payState = states.payState;
        if (payState.state == 'p201') {//已支付的不用再次通知
            continue;
        }
        var sellerInfo = order.sellerInfo;
        var buyerInfo = order.buyerInfo;
        var user = UserService.getUser(buyerInfo.userId);
        if (!user) {
            continue;
        }
        var items = order.items;
        var productId = '';
        for (var key in items) {
            var item = items[key];
            productId = item.productId;
            break;
        }
        //$.log("\n.....................in notice pay balance  preSaleObj.type:"+preSaleObj.type+"\n");
        //如果订单的尾款是按人数确定的,那么就要在尾款开始支付的一刻修改订单成交金额
        if (preSaleObj.type == '2') {
            var balance = PreSaleRuleService.getProductBalance(productId);//根据预定人数取到的尾款
            balance = (balance * 100).toFixed(0);
            var totalBalancePrice = order.priceInfo.totalBalancePrice;//订单原来保存的尾款(分)
            //如果订单的尾款与实时取的尾款不一致就要修改订单的尾款
            if (balance != totalBalancePrice) {
                var diff = balance - totalBalancePrice;
                totalBalancePrice += diff;
                var priceInfo = order.priceInfo;
                priceInfo.totalBalancePrice += diff;
                priceInfo.fTotalBalancePrice = (priceInfo.totalBalancePrice / 100).toFixed(2);
                priceInfo.totalOrderNeedPayPrice += diff;
                priceInfo.fTotalOrderNeedPayPrice = (priceInfo.totalOrderNeedPayPrice / 100).toFixed(2);
                priceInfo.totalOrderPrice += diff;
                priceInfo.fTotalOrderPrice = (priceInfo.totalOrderPrice / 100).toFixed(2);
                priceInfo.totalProductPrice += diff;
                priceInfo.fTotalProductPrice = (priceInfo.totalProductPrice / 100).toFixed(2);
                priceInfo.totalOrderRealPrice += diff;
                priceInfo.fTotalOrderRealPrice = (priceInfo.totalOrderRealPrice / 100).toFixed(2);


                for (var key in items) {
                    var item = items[key];
                    var itemPriceInfo = item.priceInfo;
                    itemPriceInfo.originalUnitPrice += diff;
                    itemPriceInfo.fOriginalUnitPrice = (itemPriceInfo.originalUnitPrice / 100).toFixed(2);
                    itemPriceInfo.unitPrice += diff;
                    itemPriceInfo.fUnitPrice = (itemPriceInfo.unitPrice / 100).toFixed(2);
                    itemPriceInfo.totalBalancePrice += diff;
                    itemPriceInfo.fTotalBalancePrice = (itemPriceInfo.totalBalancePrice / 100).toFixed(2);
                    itemPriceInfo.balancePrice += diff;
                    itemPriceInfo.fBalancePrice = (itemPriceInfo.balancePrice / 100).toFixed(2);
                    itemPriceInfo.totalPrice = (itemPriceInfo.unitPrice * item.amount).toFixed(0);
                    itemPriceInfo.fTotalPrice = (itemPriceInfo.totalPrice / 100).toFixed(2);
                }
            }
            var payInfo = {};
            var payRecs = order.payRecs;
            var isExists = false;
            var payRecId = "";
            for (var key in payRecs) {
                var payRec = payRecs[key];
                if (payRec.state != "1") {
                    payRecId = key;
                    payInfo = payRec;
                    isExists = true;
                    break;
                }
            }
            //$.log("\n.....................in notice pay balance  isExists:"+isExists+"\n");
            if (!isExists) {
                payRecId = OrderUtilService.generatorPayRecId(order);
                payInfo.payRecId = payRecId;
                //生成尾款支付信息
                payInfo.payInterfaceId = "payi_1";
                payInfo.paymentId = "";
                payInfo.paymentName = "在线支付";
                payInfo.payMoneyAmount = "0";
                payInfo.fPayMoneyAmount = "0";
                payInfo.state = "0";
                payInfo.stateName = "未支付";
                payInfo.tranSerialNo = "";
                payInfo.orderId = order.id;
                payInfo.orderAliasCode = order.aliasCode;
            }
            payInfo.moneyAmount = totalBalancePrice;
            payInfo.fMoneyAmount = (totalBalancePrice / 100).toFixed(2);
            payInfo.needPayMoneyAmount = totalBalancePrice;
            payInfo.fNeedPayMoneyAmount = (totalBalancePrice / 100).toFixed(2);

            order.payRecs[payRecId] = payInfo;
            OrderService.updateOrder(orderId, order, "u_sys");
        }

        var createDateTime = DateUtil.getLongDate(order.createTime);
        var orderItems = OrderUtilService.getItems(order);
        var orderStatus = OrderUtilService.getOrderAllState(order);
        var orderItemString = NoticeTriggerService.getOrderItems(orderItems);
        var label = {
            "\\[order:owner\\]": buyerInfo.realName,//下单人
            "\\[order:time\\]": createDateTime,//下单时间
            "\\[order:number\\]": order.aliasCode,//订单外部号
            "\\[order:productList\\]": orderItemString,//商品行
            "\\[order:lastPayTime\\]": lastPayTime,//预售结束时间
            "\\[order:orderstate\\]": orderStatus,//订单状态
            "messageSubType": "shopping",//预售结束时间
            "messagePageType": "orderShipping"//预售结束时间
        };

        var mobilePhone = order.preSaleMobile || user.mobilPhone;
        var email = user.email;
        var noticeId = "notice_54800";
        if (mobilePhone) {
            NoticeTriggerService.sendNotice(buyerInfo.userId, mobilePhone, noticeId, sellerInfo.merId, label);
        }
        if (email) {
            NoticeTriggerService.sendNotice(buyerInfo.userId, email, noticeId, sellerInfo.merId, label);
        }
    }
})();