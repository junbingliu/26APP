//#import Util.js
//#import pigeon.js
//#import order.js
//#import DateUtil.js
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffArgService.jsx
//#import $DirectFirstOrderHalfOffEvent:services/DirectFirstOrderHalfOffLogService.jsx

var DirectFirstOrderHalfOffService = (function (pigeon) {

    var f = {
        doFirstOrderHalfOff: function (jOrder) {
            //$.log("..................................................................123456789123456789123456789123456.。。。8888");
            var items = jOrder.optJSONObject("items");
            if (!items) {
                return;
            }

            var createTime = Number(jOrder.optString("createTime") + "");
            var merchantId = jOrder.optString("merchantId") + "";
            var orderAliasCode = jOrder.optString("aliasCode") + "";
            var jArgs = DirectFirstOrderHalfOffArgService.getArgs();
            var activityId = DirectFirstOrderHalfOffArgService.getValueByKey(jArgs, "activityId");
            if (!activityId || activityId == "") {
                //$.log(".............................................................DirectFirstOrderHalfOffService.....活动ID未空，orderAliasCode=" + orderAliasCode);
                return;
            }
            var checkResult = DirectFirstOrderHalfOffArgService.checkMerchantId(jArgs, merchantId);
            if (checkResult.code != "0") {
                //$.log("..................................................................当前商家不在规则范围内，orderAliasCode=" + orderAliasCode);
                return;
            }

            var ruleBeginDateTime = jArgs.beginDateTime;
            var ruleEndDateTime = jArgs.endDateTime;
            if (!ruleBeginDateTime || ruleBeginDateTime == "" || !ruleEndDateTime || ruleEndDateTime == "") {
                //$.log("..................................................................规则未设置下单起止时间" + orderAliasCode);
                return;
            }

            if (!(createTime > Number(ruleBeginDateTime) && createTime < Number(ruleEndDateTime))) {
                //$.log("..................................................................下单时间不在规则范围内，orderAliasCode=" + orderAliasCode);
                return;
            }

            var buyerUserId = "";
            var jBuyerInfo = jOrder.optJSONObject("buyerInfo");
            if (jBuyerInfo) {
                buyerUserId = jBuyerInfo.optString("userId") + ""
            }
            var jUserLog = DirectFirstOrderHalfOffLogService.getUserLog(activityId, buyerUserId);
            if (jUserLog) {
                //当前用户已参与过该首单五折优惠
                //$.log("..................................................................当前用户已参与过该首单五折优惠，orderAliasCode=" + orderAliasCode + "....buyerUserId=" + buyerUserId);
                return;
            }

            var names = $.getNames(items);
            f.calcAndSetItemNewUnitPrice(items, names);//计算比设置item的新成交价

            var newFTotalProductPrice = 0;
            //五折后金额小于等于80的，全部五折计算
            for (var i = 0; i < names.length; i++) {
                var itemId = names[i];
                var jItem = items.optJSONObject(itemId);
                var jPriceInfo = jItem.optJSONObject("priceInfo");

                var fUnitPrice = Number(jPriceInfo.optString("fUnitPrice") + "");
                var amount = Number(jItem.optString("amount") + "");

                var newFTotalPrice = fUnitPrice * amount;
                newFTotalProductPrice += newFTotalPrice;

                jPriceInfo.put("fTotalPrice", newFTotalPrice);
                jPriceInfo.put("totalPrice", (Number(newFTotalPrice) * 100).toFixed(0));
                jPriceInfo.put("fTotalGiveProductIntegral", newFTotalPrice);
                jPriceInfo.put("totalGiveProductIntegral", (Number(newFTotalPrice) * 100).toFixed(0));
                //$.log("\n........................................................newFTotalPrice=" + newFTotalPrice);
            }

            newFTotalProductPrice = (newFTotalProductPrice * 1).toFixed(2);

            var jOrderPriceInfo = jOrder.optJSONObject("priceInfo");
            var fTotalDeliveryPrice = Number(jOrderPriceInfo.optString("fTotalDeliveryPrice") + "");
            var newFTotalOrderRealPrice = ((Number(newFTotalProductPrice) + fTotalDeliveryPrice) * 1).toFixed(2);
            var newFTotalOrderPrice = newFTotalOrderRealPrice;
            var newFTotalOrderNeedPayPrice = newFTotalOrderRealPrice;

            jOrderPriceInfo.put("fTotalOrderRealPrice", newFTotalOrderRealPrice);
            jOrderPriceInfo.put("totalOrderRealPrice", (Number(newFTotalOrderRealPrice) * 100).toFixed(0));
            jOrderPriceInfo.put("fTotalProductPrice", newFTotalProductPrice);
            jOrderPriceInfo.put("totalProductPrice", (Number(newFTotalProductPrice) * 100).toFixed(0));
            jOrderPriceInfo.put("fTotalOrderPrice", newFTotalOrderPrice);
            jOrderPriceInfo.put("totalOrderPrice", (Number(newFTotalOrderPrice) * 100).toFixed(0));
            jOrderPriceInfo.put("fTotalOrderNeedPayPrice", newFTotalOrderNeedPayPrice);
            jOrderPriceInfo.put("totalOrderNeedPayPrice", (Number(newFTotalOrderNeedPayPrice) * 100).toFixed(0));
            jOrderPriceInfo.put("fIntegralGivePrice", newFTotalProductPrice);
            jOrderPriceInfo.put("integralGivePrice", (Number(newFTotalProductPrice) * 100).toFixed(0));

            //处理支付记录金额
            var jPayRecs = jOrder.optJSONObject("payRecs");
            var payRecNames = $.getNames(jPayRecs);
            for (var k = 0; k < payRecNames.length; k++) {
                var payRecId = payRecNames[k];
                var jPayRec = jPayRecs.optJSONObject(payRecId);

                jPayRec.put("fNeedPayMoneyAmount", newFTotalOrderRealPrice);
                jPayRec.put("needPayMoneyAmount", (Number(newFTotalOrderRealPrice) * 100).toFixed(0));
                jPayRec.put("fMoneyAmount", newFTotalOrderRealPrice);
                jPayRec.put("moneyAmount", (Number(newFTotalOrderRealPrice) * 100).toFixed(0));
            }

            var longContent = "订单号为【" + orderAliasCode + "】享受了活动ID为【" + activityId + "】的首单五折优惠";
            if (buyerUserId && buyerUserId != "") {
                DirectFirstOrderHalfOffLogService.addUserLog(activityId, buyerUserId, orderAliasCode);
                longContent += "，同时已成功标记为已参与首单五折。"
            }
            DirectFirstOrderHalfOffLogService.addLog("order", orderAliasCode, buyerUserId, longContent);

        },
        getTotalProductPrice: function (items, names) {
            var fTotalPrice = 0;
            for (var i = 0; i < names.length; i++) {
                var itemId = names[i];
                var jItem = items.optJSONObject(itemId);
                var jPriceInfo = jItem.optJSONObject("priceInfo");

                fTotalPrice += Number(jPriceInfo.optString("fTotalPrice") + "");
            }

            return fTotalPrice;
        },
        calcAndSetItemNewUnitPrice: function (items, names) {
            var totalProductPrice = f.getTotalProductPrice(items, names);//原商品成交总价
            var totalHalfOffPrice = Number((totalProductPrice / 2).toFixed(2));//五折后的优惠金额

            var finalProductPrice;
            if (totalHalfOffPrice > 80) {
                //如果五折后优惠金额大于80，则最多优惠80
                finalProductPrice = totalProductPrice - 80;
            } else {
                //小于80，则可以全部五折
                finalProductPrice = totalHalfOffPrice;
            }

            for (var i = 0; i < names.length; i++) {
                var itemId = names[i];
                var jItem = items.optJSONObject(itemId);
                var jPriceInfo = jItem.optJSONObject("priceInfo");

                var fUnitPrice = Number(jPriceInfo.optString("fUnitPrice") + "");
                var newFUnitPrice = ((fUnitPrice / totalProductPrice) * finalProductPrice).toFixed(3);//新的成交单价
                newFUnitPrice = newFUnitPrice.substring(0, newFUnitPrice.lastIndexOf('.') + 3);

                //$.log("\n........................................................fUnitPrice=" + fUnitPrice);
                //$.log("\n........................................................newFUnitPrice=" + newFUnitPrice);
                jPriceInfo.put("fUnitPrice", newFUnitPrice);
                jPriceInfo.put("unitPrice", (Number(newFUnitPrice) * 100).toFixed(0));
                jPriceInfo.put("fGiveProductIntegral", newFUnitPrice);
                jPriceInfo.put("giveProductIntegral", (Number(newFUnitPrice) * 100).toFixed(0));
            }
        },
        statFinalProductPrice: function (userId, totalProductPrice, merchantId) {
            var result = {};
            try {
                if (!userId) {
                    result.code = "102";
                    result.msg = "userId参数错误";
                    return result;
                }
                if (!totalProductPrice) {
                    result.code = "103";
                    result.msg = "price参数错误";
                    return result;
                }

                var jArgs = DirectFirstOrderHalfOffArgService.getArgs();
                var checkResult = DirectFirstOrderHalfOffArgService.checkMerchantId(jArgs, merchantId);
                if (checkResult.code != "0") {
                    result.code = "104";
                    result.msg = "当前商家不参加活动";
                    return result;
                }

                var activityId = DirectFirstOrderHalfOffArgService.getValueByKey(jArgs, "activityId");
                if (!activityId || activityId == "") {
                    result.code = "300";
                    result.price = totalProductPrice;
                    result.msg = "activityId未配置，使用原价返回";
                    return result;
                }

                var ruleBeginDateTime = jArgs.beginDateTime;
                var ruleEndDateTime = jArgs.endDateTime;
                if (!ruleBeginDateTime || ruleBeginDateTime == "" || !ruleEndDateTime || ruleEndDateTime == "") {
                    result.code = "105";
                    result.price = totalProductPrice;
                    result.msg = "生效起止时间未设置";
                    return result;
                }

                var createTime = new Date().getTime();
                if (!(createTime > Number(ruleBeginDateTime) && createTime < Number(ruleEndDateTime))) {
                    result.code = "106";
                    result.price = totalProductPrice;
                    result.msg = "不在有效时间范围内";
                    return result;
                }

                var jUserLog = DirectFirstOrderHalfOffLogService.getUserLog(activityId, userId);
                if (jUserLog) {
                    result.code = "300";
                    result.price = totalProductPrice;
                    result.msg = "该用户已享受过五折优惠，使用原价返回";
                    return result;
                }

                var totalHalfOffPrice = Number((Number(totalProductPrice) / 2).toFixed(2));//五折后的优惠金额

                var finalProductPrice;
                if (totalHalfOffPrice > 80) {
                    //如果五折后优惠金额大于80，则最多优惠80
                    finalProductPrice = "80.00";
                } else {
                    //小于80，则可以全部五折
                    finalProductPrice = totalHalfOffPrice;
                }

                finalProductPrice = (finalProductPrice * 1).toFixed(2);

                result.code = "200";
                result.price = finalProductPrice;
                result.msg = "该用户可以享受五折优惠，已返回五折后价格";
                return result;
            }
            catch (e) {
                result.code = "100";
                result.price = "";
                result.msg = "请求出现异常，使用原价返回";
                return result;
            }
        }
    };
    return f;
})($S);