//#import Util.js
//#import order.js
//#import account.js
//#import card.js
//#import user.js
//#import NoticeTrigger.js
//#import DateUtil.js
/**
 * 订单支付后，赠送积分和激活已赠送给会员的券
 */
(function () {
    if (typeof orderId == "undefined") {
        return;
    }
    var jOrder = OrderService.getOrder(orderId);
    if (!jOrder) {
        return;
    }
    try {
        var payState = jOrder.states.payState.state;
        if (payState == "p200") {
            $.log("............" + orderId + ",订单未支付，赠送积分和券:" + payState);
            return;
        }
        var jPriceInfo = jOrder.priceInfo;
        var integralGivePrice = jPriceInfo.integralGivePrice;
        var buyUserId = jOrder.buyerInfo.userId;
        var orderSellerId = jOrder.sellerInfo.merId;
        $.log("..............订单：" + jOrder.aliasCode + ",开始赠送积分，赠送积分值:" + integralGivePrice);
        if (integralGivePrice > 0) {
            AccountService.updateUserBalance(buyUserId, orderSellerId, "shoppingIntegral", jPriceInfo.fIntegralGivePrice, "订单支付送积分", "transactionType_first_order_give_integral", orderId + "");
            OrderApi.OrderSignUtil.doGiveUserIntegralOfOrder($.JSONObject(jOrder));//将订单标识成已经送积分
            $.log("..............订单：" + jOrder.aliasCode + ",积分赠送成功，赠送积分值:" + integralGivePrice);

            var userId = jOrder.buyerInfo.userId;
            var integralBalance = "" + AccountService.getUserBalance(userId, "head_merchant", "shoppingIntegral");

            var jUser = UserService.getUser(userId);
            var jLabel = {};
            jLabel["\\[user:name\\]"] = jUser.loginId || "";
            jLabel["\\[user:realName\\]"] = jUser.realName || "";
            jLabel["\\[account:type\\]"] = "订单支付送积分";
            jLabel["\\[account:time\\]"] = DateUtil.getLongDate(new Date().getTime());
            jLabel["\\[account:amount\\]"] = jPriceInfo.fIntegralGivePrice;//赠送值
            jLabel["\\[account:balance\\]"] = integralBalance;//积分余额
            jLabel["\\[account:reason\\]"] = jOrder.aliasCode + "订单支付赠送积分";
            if (jLabel != null) {
                NoticeTriggerService.send(jOrder.buyerInfo.userId, "notice_55300", jOrder.sellerInfo.merId, jLabel);//积分获取触发器
            }
        }
        //如果订单有需要赠送的券
        if (jOrder.giveCardInfo && jOrder.giveCardInfo.couponsInfo && jOrder.giveCardInfo.couponsInfo.length > 0) {
            var couponsInfo = jOrder.giveCardInfo.couponsInfo;
            for (var i = 0; i < couponsInfo.length; i++) {
                var cardId = couponsInfo[i];
                if (!cardId) {
                    continue;
                }
                var flag = CardService.activateCard(cardId, "激活卡，卡号为:" + cardId.replace('card_cardType_coupons_', '') + "，此卡是订单 " + jOrder.aliasCode + " 赠送!");
                $.log("..............订单：" + jOrder.aliasCode + ",卡券激活成功，卡号:" + cardId.replace('card_cardType_coupons_', '') + ",flag:" + flag);
            }

        } else {
            $.log("............" + orderId + ",订单不需要送券:" + JSON.stringify(jOrder.giveCardInfo));
        }
    } catch (e) {
        $.log("order_give_coupon_task.jsx，" + orderId + ",订单赠送积分和券给用户出现异常：" + e);
    }

})();