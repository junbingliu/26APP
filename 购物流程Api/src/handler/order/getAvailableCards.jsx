//#import Util.js
//#import login.js
//#import card.js
//#import cart.js
var userId = LoginService.getFrontendUserId();
var mycards = CardService.getUserCardList(userId, "cardType_coupons", "0", "-1");
var cards = mycards.lists;
var newCards = [];
var bigCart = CartService.getNativeBigCart(false);
var sBigCart = "" + bigCart.toString();
var oBigCart = JSON.parse(sBigCart);
var availableBatches = getAvailableBatchs(oBigCart);

for (var i = 0; i < cards.length; i++) {
    var card = cards[i];

    if (!card) {
        continue;
    }
    if (card.usable === "Y" && card.activated === "1" && availableBatches[card.cardBatchId]) {
        newCards.push(card);
    }
}
mycards.lists = newCards;
mycards.total = newCards.length;
var ret = {
    state: "ok",
    cards: mycards
}
out.print(JSON.stringify(ret));


function getAvailableBatchs(bigCart) {
    var availableBatches = {};
    if (!bigCart) {
        return availableBatches;
    }
    var cartKeys = Object.keys(bigCart.carts);
    cartKeys.forEach(function (cartId) {
        var cart = bigCart.carts[cartId];
        if (cart.orderRules) {
            var orderRuleKeyList = Object.keys(cart.orderRules);
            if (orderRuleKeyList) {
                orderRuleKeyList.forEach(function (orderRuleKey) {
                    if (cart.orderRules[orderRuleKey] && cart.orderRules[orderRuleKey].result && cart.orderRules[orderRuleKey].result.applied && cart.orderRules[orderRuleKey].result.type === "OUC") {
                        var availableCardRules = cart.orderRules[orderRuleKey].result.availableCardRules;
                        availableCardRules.forEach(function (availableCardRule) {
                            if (availableCardRule && availableCardRule.availableBatches) {
                                availableCardRule.availableBatches.forEach(function (cardBatch) {
                                    availableBatches[cardBatch.id] = cardBatch.id;
                                });
                            }
                        });
                    }
                });
            }
        }
        var cartItems = cart.items;
        for (var key in cartItems) {
            if (cartItems[key]) {
                var item = cartItems[key];
                if (item.checked == false || item.checked === "false") {
                    continue;
                }
                var productRules = item.productRules;
                if (productRules) {
                    var productRuleKeyList = Object.keys(productRules);
                    if (productRuleKeyList) {
                        productRuleKeyList.forEach(function (productRuleKey) {
                            if (productRules[productRuleKey] && productRules[productRuleKey].result && productRules[productRuleKey].result.applied && productRules[productRuleKey].result.type === "puc") {
                                var availableCardRules = productRules[productRuleKey].result.availableCardRules;
                                availableCardRules.forEach(function (availableCardRule) {
                                    if (availableCardRule && availableCardRule.availableBatches) {
                                        availableCardRule.availableBatches.forEach(function (cardBatch) {
                                            availableBatches[cardBatch.id] = cardBatch.id;
                                        });
                                    }
                                });
                            }
                        });
                    }
                }
            }
        }
    });
    return availableBatches;
}