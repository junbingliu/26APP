//#import pigeon.js
//#import Util.js
//#import OrderUtil.js
//#import $preSaleRule:libs/preSaleRule.jsx
//#import order.js
//#import jobs.js

(function () {
    //这个事件用于修改商品的订购数量,并生成一条尾款的未支付的支付信息
    var jOrder = ctx.get("order");           //订单对象
    var jsObject = JSON.parse(jOrder.toString() + "");
    if (jsObject && jsObject.orderType == 'preSale') {
        var preSalePayState = PreSaleRuleService.getPreSalePayState(jsObject.aliasCode);//预售订单支付情况
        var totalDepositPrice = jsObject.priceInfo.totalDepositPrice;//定金
        var totalBalancePrice = jsObject.priceInfo.totalBalancePrice;//尾款
        var totalOrderPayPrice = jsObject.priceInfo.totalOrderPayPrice;//已支付金额
        var totalOrderNeedPayPrice = jsObject.priceInfo.totalOrderNeedPayPrice;//待支付金额
        if (!preSalePayState || preSalePayState == 0 || preSalePayState == null) {
            var items = jsObject.items;
            //如果订单已支付金额 大于等于 定金,就将预订人数+1
            if (totalOrderPayPrice >= totalDepositPrice) {
                var productId = '';
                var amount = 0;
                for (var k in items) {
                    var jItem = items[k];
                    productId = jItem.productId;
                    var skuId = jItem.skuId;
                    //根据商品ID取预售规则
                    var preSaleRule = PreSaleRuleService.getProductPreSaleRule(productId);
                    amount = Number(jItem.amount) * (preSaleRule.rate || 1);
                    PreSaleRuleService.updateBookAmount(productId, skuId, amount);
                }
                //增加显示数量
                PreSaleRuleService.updateDisplayAmount(preSaleRule,amount);
                //将订单加放到已付订单预售列表,等可以支付尾款时通知会员
                if (preSaleRule && preSaleRule.id) {
                    PreSaleRuleService.addOrderToPreSaleDepositPaidList(preSaleRule.id, jsObject);
                }
                var state = 1;//已付定金
                if(totalBalancePrice <= 0){
                    state = 2;//已付尾款
                }
                PreSaleRuleService.setPreSalePayState(jsObject.aliasCode, state);

                //如果还有尾款未付清,那就把订单加入到自动取消队列
                if(totalBalancePrice > 0){
                    //订单付过定金后把订单加入到自动取消队列,如果订单没有支付尾款,就在尾款支付时间30秒后取消掉
                    var endLongTime = Number(preSaleRule.endLongTime) + 30 *1000;
                    var orderId = jsObject.id;
                    var className = "net.xinshi.isone.modules.order.task.OrderAutoCloseTask";
                    var params = orderId;
                    JobsService.submitJavaTask(className,params,endLongTime);
                }

                //如果预售类型是按人数预定人数确定尾款的,那也不能增加尾款支付信息,需要等到开始支付尾款时,才能确定尾款的金额
                if(preSaleRule.type == '2'){
                    return;
                }
                //如果是一次性付清全款的,那就不用再生成尾款支付信息,如果订单未支付金额 = 0 就不增加尾款支付信息
                if(totalOrderNeedPayPrice <= 0){
                    return;
                }

                var payRecs = jOrder.optJSONObject("payRecs");
                var jPayRecs = JSON.parse(payRecs + "");
                var totalNeedPay = 0;//支付记录中未支付金额
                for(var payId in jPayRecs){
                    var jPayRec = jPayRecs[payId];
                    if(jPayRec.state == "1"){
                        continue;
                    }
                    totalNeedPay += Number(jPayRec.needPayMoneyAmount);
                }
                //如果支付记录中已经存在未支付的记录，那就不需要再生成未支付的记录
                if(totalNeedPay < totalOrderNeedPayPrice) {
                    totalOrderNeedPayPrice = totalOrderNeedPayPrice - totalNeedPay;
                    //生成尾款支付信息
                    var payRecId = OrderUtilService.generatorPayRecId(jsObject);
                    var payInfo = {};
                    payInfo.payRecId = payRecId;
                    payInfo.payInterfaceId = "payi_1";
                    payInfo.paymentId = "";
                    payInfo.paymentName = "在线支付";
                    payInfo.moneyAmount = totalOrderNeedPayPrice;
                    payInfo.fMoneyAmount = (totalOrderNeedPayPrice / 100).toFixed(2);
                    payInfo.payMoneyAmount = "0";
                    payInfo.fPayMoneyAmount = "0";
                    payInfo.needPayMoneyAmount = totalOrderNeedPayPrice;
                    payInfo.fNeedPayMoneyAmount = (totalOrderNeedPayPrice / 100).toFixed(2);
                    payInfo.state = "0";
                    payInfo.stateName = "未支付";
                    payInfo.tranSerialNo = "";
                    payInfo.orderId = jsObject.id;
                    payInfo.lastModifyTime = new Date().getTime();
                    var javaPayRec = $.toJavaJSONObject(payInfo);
                    payRecs.put(payRecId, javaPayRec);
                }
            }
        }else if(preSalePayState == 1){//已付定金未付尾款
            //如果订单尾款小于等于0,那么就表示订单已付清全款
            if(totalBalancePrice <= 0) {
                PreSaleRuleService.setPreSalePayState(jsObject.aliasCode, 2);
                return;
            }
            //如果订单已支付金额大于订金加尾款,那么就表示订单已付清全款
            if(Number(totalOrderPayPrice) >= (Number(totalDepositPrice) + Number(totalBalancePrice))){
                PreSaleRuleService.setPreSalePayState(jsObject.aliasCode, 2);
                return;
            }
        }
    }
})();