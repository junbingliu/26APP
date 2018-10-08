//#import Util.js
//#import login.js
//#import $limitActivity:services/limitActivity.jsx
(function () {
    var jItem = ctx.get("item");
    var productId = "" + jItem.optString('productId');
    var shoppingCart = ctx.get("carts");
    var userId = shoppingCart.opt("userId");
    if (!userId) {
        userId = "-1";
    }
    else {
        userId = "" + userId;
    }
    var toNumber = Number(ctx.get("toNumber"));
    var found = false;
    var currentActivity = null;
    var n = 0;
    var now = new Date().getTime();

    while (!found) {
        var activities = LimitActivityService.getActivities(productId, n, 5);
        if (!activities || activities.length == 0) {
            return;
        }
        n += 5;
        for (var i = 0; i < activities.length; i++) {
            var activity = activities[i];
            if (now > activity.endTime) {
                return;
            }
            if (now > activity.beginTime) {
                currentActivity = activity;
                break;
            }
        }
        if (currentActivity) {
            break;
        }
    }
    if (currentActivity) {
    }
    else {
        return;
    }
    var getCartNumber = function (jCarts, jItem, productId) {
        if (!jCarts || !jItem || !productId) {
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
                    //if (curItemId && itemId == curItemId) {
                    //    continue;
                    //}
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

    if (currentActivity) {
        //var toNumber = Number(ctx.get("toNumber"));
        var toNumber = getCartNumber(shoppingCart, jItem, productId);
        if (currentActivity.numberPerActivity && currentActivity.numberPerActivity > 0) {
            var activityBoughtNumber = Number(LimitActivityService.getActivityBoughtNumber(currentActivity.id));
            if (activityBoughtNumber + toNumber > currentActivity.numberPerActivity) {
                ctx.put("msg", "手慢了哦，本轮结束，下轮再接再厉！");
                ctx.put("state", "error");
                return;
            }
        }
        if (currentActivity.numberPerUser && currentActivity.numberPerUser > 0) {
            if (!userId || userId == "-1") {
                ctx.put("msg", "本商品需要登录才能购买。");
                ctx.put("state", "error");
                return;
            }
            var userBoughtNumber = Number(LimitActivityService.getUserBoughtNumber(currentActivity.id, userId));
            if (userBoughtNumber + toNumber > currentActivity.numberPerUser) {
                ctx.put("msg", "一人只能购买" + currentActivity.numberPerUser + "件");
                ctx.put("state", "error");
                ctx.put("userBoughtNumber",userBoughtNumber);
                ctx.put("toNumber",toNumber);
                ctx.put("currentActivity.numberPerUser" ,currentActivity.numberPerUser);
                ctx.put("userBoughtNumber + toNumber" , userBoughtNumber + toNumber);
                return;
            }
        }
    }

})();


