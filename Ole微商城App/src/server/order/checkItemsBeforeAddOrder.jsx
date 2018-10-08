//#import Util.js
//#import login.js
//#import cart.js
//#import product.js
//#import @server/util/ErrorCode.jsx
//#import @server/util/H5CommonUtil.jsx
;
(function () {
    var cartId = $.params.cartId;
    if (!cartId) {
        H5CommonUtil.setErrorResult(ErrorCode.E1M000000);
        return;
    }

    var jBigCart = CartService.getBigCart();

    var carts = jBigCart.carts;
    var jCart = carts[cartId];

    var items = jCart.items;
    var firstItem = null;
    for (var key in items) {
        firstItem = items[key];
        if (firstItem) {
            break;
        }
    }

    var productId = firstItem.productId;

    var jProduct = ProductService.getProductWithoutPrice(productId);
    var deliveryWay = jProduct.deliveryWay || "0";

    $.log("\n......................productId="+productId);
    $.log("\n......................deliveryWay="+deliveryWay);
    if (deliveryWay == "1") {
        $.log("\n......................deliveryWay1="+deliveryWay);
        //自提商品，检查一下购物车中是否有其他商品，如果有则不允许添加
        for (var key in items) {
            var jItem = items[key];
            var iProductId = jItem.productId;

            if (iProductId != productId) {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000000, "", "购物车中存在不能一起配送的商品，请单独购买个别商品");
                return;
            }
        }
    } else {
        $.log("\n......................deliveryWay2="+deliveryWay);
        //非自提商品，检查一下购物车中是否有自提商品，如果有则不允许添加
        for (var key in items) {
            var jItem = items[key];
            var iProductId = jItem.productId;

            var iProduct = ProductService.getProductWithoutPrice(iProductId);
            var itemDeliveryWay = iProduct.deliveryWay || "0";
            if (itemDeliveryWay == "1") {
                H5CommonUtil.setErrorResult(ErrorCode.E1M000000, "", "购物车中存在不能一起配送的商品，请单独购买个别商品");
                return;
            }
        }
    }

    H5CommonUtil.setSuccessResult();

})();


