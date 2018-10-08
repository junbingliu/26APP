//#import pigeon.js
//#import Util.js
//#import OrderUtil.js
//#import user.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    //这个事件用于修改会员的尾款信息通知号码和加入到预售订单列表
    var javaOrder = ctx.get("order_object");           //订单对象
    var jsObject = JSON.parse(javaOrder.toString() + "");
    if (!jsObject) {
        return;
    }
    if (jsObject && jsObject.orderType == 'preSale') {
        var buyerInfo = jsObject.buyerInfo;
        var user = UserService.getUser(buyerInfo.userId);
        if (!user) {
            return;
        }
        //如果用户现有的号码与这次提交的不一样,那就修改预售通知号码
        if (user.preSaleMobile != jsObject.preSaleMobile) {
            user.preSaleMobile = jsObject.preSaleMobile;
            UserService.updateUserPreSaleMobile(user.id, jsObject.preSaleMobile);
        }

        var items = jsObject.items;
        var productId = '';
        for (var k in items) {
            var jItem = items[k];
            productId = jItem.productId;
        }
        //根据商品ID取预售规则
        var preSaleRule = PreSaleRuleService.getProductPreSaleRule(productId);
        javaOrder.put("preSaleRuleId", preSaleRule.id);
        //将订单加入到预售列表
        if (preSaleRule && preSaleRule.id) {
            PreSaleRuleService.addOrderToPreSaleList(preSaleRule.id, jsObject);
        }
    }
})();