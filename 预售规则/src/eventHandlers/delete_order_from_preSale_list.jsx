//#import pigeon.js
//#import Util.js
//#import OrderUtil.js
//#import user.js
//#import $preSaleRule:libs/preSaleRule.jsx

(function () {
    //订单取消或签收后将订单从预售列表删除
    var jOrder = ctx.get("order_object");           //订单对象
    var jsObject = JSON.parse(jOrder.toString() + "");
    if (!jsObject) {
        return;
    }
    if (jsObject && jsObject.orderType == 'preSale') {
        var items = jsObject.items;
        var productId = '';
        for (var k in items) {
            var jItem = items[k];
            productId = jItem.productId;
            break;
        }
        //根据商品ID取预售规则
        var preSaleRule = PreSaleRuleService.getProductPreSaleRule(productId);

        //将订单从预售列表删除
        if (preSaleRule && preSaleRule.id) {
            PreSaleRuleService.deleteOrderFormPreSaleDepositPaidList(preSaleRule.id, jsObject);
            PreSaleRuleService.deleteOrderFormPreSaleList(preSaleRule.id, jsObject);
        }
    }
})();