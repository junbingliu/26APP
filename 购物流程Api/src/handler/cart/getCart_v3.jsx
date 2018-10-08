//#import Util.js
//#import product.js
//#import DynaAttrUtil.js
//#import cart.js
//#import sku.js
//#import DssUtil.js
//#import login.js
//#import user.js
//#import merchant.js
//#import payment.js
//#import merchant.js
//#import $paymentSetting:services/paymentSettingService.jsx
;(function () {
    var t1 = new Date().getTime();
    var userId = LoginService.getFrontendUserId();
    var t2 = new Date().getTime();

    var userMobile = "";
    if (userId && userId != "") {
        var jUser = UserService.getUser(userId);
        if (jUser) {
            userMobile = jUser.mobilPhone || "";
        }
    }

    var mode = $.params.mode;
    var needCheck7Day = $.params.needCheck7Day;


    /*if (!mode || mode != "form") {
     clearAllCombiProduct();
     }*/
    var bigCart = CartService.getNativeBigCart(false);
    if (!bigCart) {
        var ret = {
            state: "empty",
            msg: "购物车是空的。1"
        }
        out.print(JSON.stringify(ret));
        return;
    }
    var t3 = new Date().getTime();

    var userAgent = DssService.getUserAgent(request);
    if (userAgent.deviceCategory == "Personal computer") {
        bigCart.put("buyingDevice", "pc");
    }
    else {
        bigCart.put("buyingDevice", "mobile");
    }
    //$.log("\n\n\n\n\n bigCart = " + bigCart + " \n\n\n\n\n\n");
    CartService.upgrade(bigCart);
    CartService.populatePrices(bigCart, userId, 0, true);
    var isDirty = CartService.executePlans(bigCart, userId, 10 * 60 * 1000, true);
    CartService.calculateDeliveryRulesForAll(bigCart, userId);
    if (isDirty) {
        CartApi.IsoneOrderEngine.shoppingCart.updateShoppingCart(bigCart);
    }

    var t4 = new Date().getTime();
    var sBigCart = "" + bigCart.toString();
    var oBigCart = JSON.parse(sBigCart);
    var cartKeys = Object.keys(oBigCart.carts);
    cartKeys.forEach(function (cartId) {
        var cart = oBigCart.carts[cartId];
        var inheritPlatform = PaymentSettingService.getInheritPlatform(cart.merchantId);
        if (inheritPlatform) {
            cart.payMerchantId = "head_merchant";
        }
        else {
            cart.payMerchantId = cart.merchantId;
        }
        var paymentList = [];
        var codPayment = PaymentService.getCodPayment(cart.payMerchantId);
        if (codPayment) {
            codPayment.isOnline = false;
            codPayment.isCod = true;
            codPayment.desc = "送货上门后再收款、支持现金、pos机刷卡、支票支付 查看服务及配送范围";
            paymentList.push(codPayment);
        }

        var onlinePayment = PaymentService.getOnlinePayment(cart.payMerchantId);
        if (onlinePayment) {
            onlinePayment.isOnline = true;
            onlinePayment.isCod = false;
            onlinePayment.desc = "即时到帐，支持绝大数银行借记卡及部分银行信用卡";
            paymentList.push(onlinePayment);
        }
        cart.paymentList = paymentList;

        var itemKeys = Object.keys(cart.items);
        itemKeys.forEach(function (itemId) {
            var item = cart.items[itemId];

            var cxt = "{attrs:{},factories:[{factory:RPF},{factory:MF,isBasePrice:true}]}"
            var priceList = ProductService.getPriceValueList(item.productId, userId, item.merchantId, 1, cxt, 'normalPricePolicy');
            if (priceList[0] && priceList[0].isSpecialPrice && priceList[0].isSpecialPrice == "Y") {
                var endDateTime = (priceList[0] && priceList[0].endDateTime);

            }
            item.endDateTime = endDateTime;


        });


        if (cart.deliveryRuleResults) {
            for (var j = 0, deliveryRuleResultlen = cart.deliveryRuleResults.length; j < deliveryRuleResultlen; j++) {
                var selectDeliveryRuleResult = cart.deliveryRuleResults[j];
                if (selectDeliveryRuleResult.id === cart.selectedDeliveryRuleId) {
                    cart.selectDeliveryRuleResult = selectDeliveryRuleResult;
                    break;
                }
            }
        }
        var cartItems = cart.items;


        for (var key in cartItems) {
            if (cartItems[key]) {
                selectCombiProductSku(cartItems[key]);
            }
        }
    });
    if (needCheck7Day && needCheck7Day !== "") {
        check7DayAttrResult(oBigCart);
    }
    var t5 = new Date().getTime();
    var ret = {
        state: 'ok',
        bigCart: oBigCart,
        getCartTime: t3 - t1,
        executePlansTime: t4 - t3,
        bigCartToJavascriptTime: t5 - t4,
        totalTime: t5 - t1

    }
    out.print(JSON.stringify(ret));
})();
function check7DayAttrResult(bigCart) {
    if (!bigCart) {
        return;
    }
    var cartKeys = Object.keys(bigCart.carts);
    cartKeys.forEach(function (cartId) {
        var cart = bigCart.carts[cartId];
        var itemKeys = Object.keys(cart.items);
        itemKeys.forEach(function (itemId) {
            var item = cart.items[itemId];


            if (item.checked == true || item.checked === "true") {
                if (item.productId.indexOf("combiProduct") == -1) {
                    var jProduct = ProductService.getProduct(item.productId);
                    var columnId = jProduct.columnId;
                    var jTemplate = DynaAttrService.getCompleteAttrTemplateByColumnId(columnId);
                    var attrValue = getAttrValue(jProduct, jTemplate, "7天退换货");
                    if (attrValue === "") {
                        bigCart["hasNot7Day"] = "true";
                        return;
                    }
                } else {
                    item.subItems.forEach(function (subItem) {
                        var jProduct = ProductService.getProduct(subItem.productId);
                        var columnId = jProduct.columnId;
                        var jTemplate = DynaAttrService.getCompleteAttrTemplateByColumnId(columnId);
                        var attrValue = getAttrValue(jProduct, jTemplate, "7天退换货");
                        if (attrValue === "") {
                            bigCart["hasNot7Day"] = "true";
                            return;
                        }
                    });
                }


            }
        });
    });
}

function getAttrIdByName(jTemplate, attrName) {
    return DynaAttrService.getAttrIdByAttrName(jTemplate, attrName, "0");
}

function getAttrValue(jProduct, jTemplate, attrName) {
    if (!jTemplate) {
        return "";
    }
    var jDynaAttrs = jProduct.DynaAttrs;
    if (!jDynaAttrs) {
        return "";
    }
    var attrId = getAttrIdByName(jTemplate, attrName);
    if (!attrId || attrId == "") {
        return "";
    }

    var jValue = jDynaAttrs[attrId];
    if (!jValue) {
        return "";
    }
    if (jValue.value) {
        return jValue.value;
    }
    if (jValue.valueIds) {
        return jValue.valueIds;
    }
    return "";
}


function selectCombiProductSku(item) {
    if (!item.isCombiProduct || !item.subItems) {
        return;
    }
    item.subItems.forEach(function (subItem) {
        var skus = ProductService.getSkusAndAttrs(subItem.productId);
        if (subItem.skuId) {
            var newSkus = skus.filter(function (sku) {
                return sku.id === subItem.skuId;
            });
            if (newSkus[0].fullAttrs && newSkus[0].fullAttrs.length > 0) {
                newSkus[0].fullAttrs.sort(function (a, b) {
                    if (a > b) return 1;
                    if (a < b) return -1;
                    return 0;
                });
                subItem.selectSku = newSkus[0].fullAttrs.map(function (attr) {
                    return attr.name
                }).join("");
            } else {
                subItem.selectSku = "默认";
            }
        } else {
            subItem.selectSku = "默认";
        }
    });
}
