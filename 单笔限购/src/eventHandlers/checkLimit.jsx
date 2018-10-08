//#import Util.js
//#import login.js
//#import user.js
//#import $limitBuy:services/limitBuyService.jsx
(function () {
    var jItem = ctx.get("item");
    var jCarts = ctx.get("carts");
    var productId = "" + jItem.optString('productId');
    var config = LimitBuyService.getConfig(productId);

    var userGroupId = config.userGroupId;
    if(!userGroupId) {
        return ;
    }
    var userId = jCarts.opt("userId");
    if (!userId) {
        userId = "-1";
    }
    else {
        userId = "" + userId;
    }

    var checkMemberGroup = UserService.checkMemberGroup(userId, userGroupId);

    if (config && checkMemberGroup) {
        // var jCarts = ctx.get("carts");
        var toNumber = Number(ctx.get("toNumber"));//toNumber只是这次购买的数量，要加上原来购物车里的数量

        var getCartNumber = function(jCarts,jItem,productId){
            if(!jCarts || !jItem || !productId){
                return 0;
            }
            var totalAmount = 0;
            var curItemId = jItem.optString("itemId");
            //这里要汇总所有购物车中这个商品的数量
            if (jCarts) {
                jCarts = JSON.parse(jCarts + "");
                for (var cartId in jCarts.carts) {
                    var jCart = jCarts.carts[cartId];
                    if (!jCart || !jCart.items || jCart.items.length == 0) {
                        continue;
                    }
                    for (var itemId in jCart.items) {
                        if(curItemId && itemId ==  curItemId){
                            continue;
                        }
                        var jCartItem = jCart.items[itemId];
                        var cartProductId = jCartItem.productId;
                        if (cartProductId == productId) {
                            totalAmount += Number(jCartItem.amount);
                        }
                    }
                }
            }
            return totalAmount;
        };

        toNumber += getCartNumber(jCarts,jItem,productId);

        if (config.minNumber && toNumber < config.minNumber && config.minNumber != -1) {
            ctx.put("msg", "当前用户组本商品最少买" + config.minNumber + "个");
            ctx.put("state", "error");
        }

        if (config.maxNumber && toNumber > config.maxNumber && config.maxNumber != -1) {
            ctx.put("msg", "本商品最多买" + config.maxNumber + "个");
            ctx.put("state", "error");
        }
    }


})();


