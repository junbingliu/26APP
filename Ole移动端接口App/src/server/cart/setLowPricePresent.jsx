//#import Util.js
//#import product.js
//#import cart.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/CartUtil.jsx

(function () {
    var ret = ErrorCode.S0A00000;
    var cartId = $.params.cartId;
    var itemId = $.params.itemId;
    var ruleId = $.params.ruleId;
    var selectionStr = $.params.selections;

    try {
        var selections = JSON.parse(selectionStr);
        var cart = CartService.getCart(cartId);
        if (itemId) {
            var item = cart.items[itemId];
        } else {
            var item = cart;
        }

        var oldPresents = item['userSelectedLowPricePresents'] || [];
        var presents = [];
        if (oldPresents) {
            oldPresents.forEach(function (p) {
                if (p.ruleId != ruleId) {
                    presents.push(p);
                }
            });
        }

        var now = new Date().getTime();
        selections.forEach(function (selection) {
            var skuId = selection.skuId;
            var productId = selection.productId;
            var number = selection.number;

            if (!skuId || skuId == 'null') {
                var headSku = ProductService.getHeadSku(productId);
                skuId = headSku.id;
            }
            var present = {
                productId: productId,
                ruleId: ruleId,
                skuId: skuId,
                time: now,
                number: number
            };
            presents.push(present);
        });
        item['userSelectedLowPricePresents'] = presents;
        CartService.updateCart(cartId, cart);

        var result = CartUtil.getCart();
        if (result.code != ErrorCode.S0A00000.code) {
            ret.code = result.code;
            ret.msg = result.msg;
            out.print(JSON.stringify(ret));
            return;
        }
        ret.data = result.data;//购物车数据
        out.print(JSON.stringify(ret));
    } catch (e) {
        $.error("设置低价换购商品失败,请求参数,cartId：" + cartId + ",itemId:" + itemId + ",错误原因:" + e);
        ret = ErrorCode.E1M000002;
        out.print(JSON.stringify(ret));
    }
})();