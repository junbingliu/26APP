//#import Util.js
//#import login.js
//#import userProfile.js
//#import address.js
//#import cart.js
//#import session.js
//#import @server/util/ErrorCode.jsx
;
(function () {
    var ret = ErrorCode.S0A00000;
    var userId = SessionService.getSessionValue("orderUserId", request) || LoginService.getFrontendUserId();
    if (!userId) {
        //还没有登录
        ret = ErrorCode.E1M000003;
        out.print(JSON.stringify(ret));
        return;
    }
    var selectedPayInterfaceId = $.params.selectedPayInterfaceId;
    if (selectedPayInterfaceId) {
        UserProfileService.setUserInfo(userId, "payInterfaceId", selectedPayInterfaceId);
    }
    var addressId = $.params.addressId;
    var merIdRuleIdPairs = $.params.merIdRuleIdPairs;
    if(!merIdRuleIdPairs || !addressId){
        ret = ErrorCode.E1M000000;
        out.print(JSON.stringify(ret));
        return;
    }
    var pairs = JSON.parse(merIdRuleIdPairs);
    pairs.forEach(function (pair) {
        var ruleId = pair.ruleId;
        var merchantId = pair.merchantId;
        var deliveryTimeId = pair.deliveryTimeId || "";
        var deliveryPointId = pair.deliveryPointId || "";
        var deliveryPointRegionId = pair.deliveryPointRegionId || "";
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
                cart.selectedDeliveryPointRegionId = deliveryPointRegionId;
                CartService.updateCart(cartId, cart);
            }
        }
    });
    out.print(JSON.stringify(ret));
})();