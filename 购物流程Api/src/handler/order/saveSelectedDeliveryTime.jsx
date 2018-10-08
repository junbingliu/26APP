//#import Util.js
//#import login.js
//#import userProfile.js
//#import address.js
//#import cart.js
//#import session.js

;
(function () {
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        var ret = {state: "err", msg: "notlogin."};
        out.print(JSON.stringify(ret));
        return;
    }
    //
    // var selectedPayInterfaceId = $.params.selectedPayInterfaceId;
    //
    // //UserProfileService.setUserInfo(buyerId,"payInterfaceId:" + merchantId,selectedPayInterfaceId);
    // UserProfileService.setUserInfo(userId, "payInterfaceId", selectedPayInterfaceId);

    //now begin to save selectedDeliveryRule.jsx
    var addressId = $.params.addressId;

    var merIdRuleIdPairs = $.params.merIdRuleIdPairs;
    var pairs = JSON.parse(merIdRuleIdPairs);
    pairs.forEach(function (pair) {
        var ruleId = pair.ruleId;
        var merchantId = pair.merchantId;
        var deliveryTimeId = pair.deliveryTimeId || "";
        var deliveryPointId = pair.deliveryPointId || "";
        var deliveryPointRegionId = pair.deliveryPointRegionId || "";
        var selectedDeliveryPointName = pair.name || "";
        var cartId = pair.cartId;
        //设置配送规则与自提点
        AddressService.setSelectedDeliveryRuleId(userId, addressId, merchantId, ruleId, deliveryPointId);
        //设置配送时间
        AddressService.setSelectedDeliveryTimeId(userId, addressId, deliveryTimeId);
        //把选中的配送规则，配送时间，自提点信息保存到购物车
        if (cartId) {
            var cart = CartService.getCart(cartId);
            if (cart) {
                cart.selectedDeliveryRuleId = ruleId;
                cart.selectedDeliveryTime = deliveryTimeId;
                cart.selectedDeliveryPointId = deliveryPointId;
                cart.selectedDeliveryPointName = selectedDeliveryPointName;
                cart.selectedDeliveryPointRegionId = deliveryPointRegionId;
                CartService.updateCart(cartId, cart);
            }
        }
    });

    var ret = {
        state: 'ok'
    }
    out.print(JSON.stringify(ret));
})();