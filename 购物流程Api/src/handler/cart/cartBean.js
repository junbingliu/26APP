function RuleResult(data){
    this.actionType = data.actionType;
    this.userFriendlyMessages = data.userFriendlyMessages;
    this.ruleId = data.ruleId;
    this.type = data.type;
    this.ruleName = data.ruleName;


}

function Present(data){
    this.icon = data.icon;
    this.name = data.name;
    this.number = data.number;
    this.price = data.price;
    this.productId = data.productId;
    this.skuId = data.skuId;
    this.realSkuId = data.realSkuId();
    this.ruleId = data.ruleId;
}

function BuyItem(data){
    this.icon = data.icon;
    this.productId = data.productId;
    this.productName = data.productName;
    this.columnId = data.columnId;
    this.columnIds = data.columnIds;
    this.number = data.number;
    this.unitPrice = data.unitPrice;
    this.totalPrice = data.totalPrice;
    this.unitDealPrice = data.unitDealPrice;
    /*满减后的成交价*/
    this.totalDealPrice = data.totalDealPrice;
    /*满减后的商品总成交价*/
    this.totalPrice = data.totalPrice;
    this.totalPayPrice = data.totalPayPrice;
    this.taxPrice = data.taxPrice;
    /*单个商品税*/
    this.totalTaxPrice = data.totalTaxPrice;
    /*商品行总税*/
    this.totalDiscount = data.totalDiscount;
    /*商品满减金额*/
    this.totalWeight = data.totalWeight / 1000;
    this.skuId = data.skuId;
    this.itemId = data.itemKey;
    this.cartId = data.cartId;
    this.readableAttributes = data.readableAttributes;
    this.attrsString = data.attrsString;
    this.checked = data.checked;
    this.selectedOrderRuleId = data.selectedOrderRuleId;
    this.orderAvailableRuleIds = data.orderAvailableRuleIds;
}

function Cart(data){
    this.merchantName = data.merchantName;
    this.merchantId = data.merchantId;
    this.totalOrderProductPrice = data.totalOrderProductPrice;/*商品总金额，未减商品优惠*/
    this.totalPayPrice = Number(data.totalPayPrice).toFixed(2);/*商品总金额，已减商品优惠*/
    this.totalTaxPrice = data.totalTaxPrice;/*购物车总税金*/
    //积分价
    this.totalIntegralPrice = data.totalIntegralPrice || 0;
    this.cartId = data.cartKey || data.cartId;
    this.isCrossBorder =data.crossBorder || false;/*是否跨境订单*/
    this.isCollectTax = data.collectTax;/*是否收税*/
    this.isFirstCrossBorder = data.isFirstCrossBorder || false;
    this.availableRuleResults = data.availableRuleResults?data.availableRuleResults.map(function(ruleResult){return new RuleResult(ruleResult)}):[];
    this.freePresents = data.freePresents?data.freePresents.map(function(present){return new Present(present)}):[];
    this.lowPricePresents = data.lowPricePresents?data.lowPricePresents.map(function(present){return new Present(present)}):[];
    this.buyItems = data.buyItems.map(function(buyItem){return new BuyItem(buyItem)});
}