//#import merchant.js
//#import $SalesAgentProduct:services/SalesAgentProductService.jsx
//#import product.js

function convertBuyItem(buyItem){
    var item = {};
    item.cartId = "" + buyItem.getCartId();
    item.itemId = "" + buyItem.getItemId();
    item.skuId = "" + buyItem.getSkuId();
    item.productId = "" + buyItem.getProductId();
    item.columnId = "" + buyItem.getColumnId();
    item.columnIds = "" + buyItem.getColumnIds();
    item.realSkuId = "" + buyItem.getRealSkuId();
    item.hasMultiSkus =  buyItem.isHasMultiSkus();
    item.unitPrice = "" + buyItem.getUnitPrice();
    item.totalPayPrice = "" + buyItem.getTotalPayPrice();
    item.number = "" + buyItem.getNumber();
    item.checked = buyItem.isChecked();
    item.productName = "" + buyItem.getProductName();
    item.icon = "" + buyItem.getIcon();
    item.attrsString = "" + buyItem.getAttrsString();
    item.selectedOrderRuleId = "" + buyItem.getSelectedOrderRuleId();
    item.isCombiProduct = buyItem.isCombiProduct();
    item.resellerId = "" + buyItem.getResellerId();


    //获取Icon
    var skus = ProductService.getSkusAndAttrs(item.productId);
    if(skus && skus.length>0){
        skus.forEach(function(sku){
          if(sku.id==item.skuId){
            if(sku.images && sku.images.length>0){
                item.icon = sku.images[0].url;
            }
          }
        });
    }


    if(item.resellerId && Number(buyItem.resellerId)!=-1){
        var resellerMerchantId = MerchantService.getMerchantIdByApplyUserId(item.resellerId);
        item.resellerMerchantId = resellerMerchantId;
        var resellerPrice = {};
        if(resellerMerchantId){
            var resellerPrices = SalesAgentProductService.getPrices(resellerMerchantId,[item.productId]);
            resellerPrice = resellerPrices[0];
            var defaultPrice = null;
            var defaultPrices = SalesAgentProductService.getPrices(resellerMerchantId,['default']);
            if(defaultPrices && defaultPrices.length>0){
                defaultPrice = defaultPrices[0];
                defaultPrice.fixedRate = true;
                // resellerPrice = defaultPrice;
            }
            if(resellerPrice){
                if(resellerPrice.shopFixedRate && defaultPrice && defaultPrice.percent){
                  item.unitPrice = item.unitPrice * defaultPrice.percent / 100;
                }
                else if(resellerPrice.fixedRate && resellerPrice.percent){
                    item.unitPrice = item.unitPrice * resellerPrice.percent / 100;
                }
                else{
                    var unitPrice = resellerPrice[item.skuId];
                    if(unitPrice){
                        item.unitPrice = unitPrice;
                    }
                }
            }
        }
    }

    if(item.unitPrice){
        item.unitPrice=Number(item.unitPrice).toFixed(2);
    }
    item.totalPayPrice = Number(item.unitPrice)* Number(item.number);


    var combiItems = [];
    if(item.isCombiProduct){
        var nativeItems = buyItem.getCombiItems();
        for(var i=0;i<nativeItems.size();i++){
            var nativeItem = nativeItems.get(i);
            var combiItem = {
                productName:"" + nativeItem.getProductName(),
                icon: "" + nativeItem.getIcon(),
                attrsString:"" + (nativeItem.getAttrsString()==null?"":nativeItem.getAttrsString()),
                number : "" + nativeItem.getNumber(),
                unitPrice: "" + nativeItem.getUnitPrice()
            };
            combiItems.push(combiItem);
        }
        item.combiItems = combiItems;
    }

    var availableRuleResults = [];
    item.availableRuleResults = availableRuleResults;
    for(var i=0; i<buyItem.getAvailableRuleResults().size();i++){
        var availableRuleResult = buyItem.getAvailableRuleResults().get(i);
        var ruleResult = {};
        ruleResult.ruleId = "" + availableRuleResult.getRuleId();
        ruleResult.ruleName = "" + availableRuleResult.getRuleName();
        ruleResult.type = "" + availableRuleResult.getType();
        ruleResult.actionType = "" + availableRuleResult.getActionType();
        var userFriendlyMessages = [];
        for(var j=0; j<availableRuleResult.getUserFriendlyMessages().size(); j++){
            userFriendlyMessages.push("" + availableRuleResult.getUserFriendlyMessages().get(j));
        }
        ruleResult.userFriendlyMessage = userFriendlyMessages.join(";");
        if(ruleResult.type=="olpbr" || ruleResult.type=="plpbr" || ruleResult.type=='ppr' || ruleResult.type=='opr'){
            var availablePresents = availableRuleResult.getAvailablePresents();
            var presents = [];
            for(var j=0; j<availablePresents.size();j++){
                var p = availablePresents.get(j);
                var present = {
                    icon:"" + p.getIcon(),
                    name:"" + p.getName(),
                    number:"" + p.getNumber(),
                    price:"" + p.getPrice(),
                    productId:"" + p.getProductId(),
                    skuId:"" + p.getSkuId(),
                    realSkuId:"" + p.getRealSkuId(),
                    needChooseSku:p.getSkus()!=null && p.getSkus().size()>1
                }
                presents.push(present);
            }
            ruleResult.availablePresents = presents;
            ruleResult.amount = availableRuleResult.getAmount();
            try{
              ruleResult.leftNumber = availableRuleResult.getLeftNumber();
            }
            catch(e){}
        }
        availableRuleResults.push(ruleResult);
    }

    item.orderAvailableRules = [];
    for(var i=0; i<buyItem.getOrderAvailableRules().size(); i++){
        var oRule = buyItem.getOrderAvailableRules().get(i);
        var rule = {
            name: "" + oRule.getName(),
            id:   "" + oRule.getId(),
            description : "" + oRule.getDescription()
        }
        item.orderAvailableRules.push(rule);
    }

    //freePresents
    var freePresents = [];
    item.freePresents = freePresents;
    for(var i=0; i<buyItem.getFreePresents(); i++){
        var presentRecord = buyItem.getFreePresents().get(i);
        var present ={
            ruleId:"" + presentRecord.getRuleId(),
            productId: "" + presentRecord.getProductId(),
            name: "" + presentRecord.getName(),
            number: presentRecord.getNumber(),
            price : "" + presentrecord.getPrice(),
            skuId: "" + presentrecord.getSkuId(),
            icon: "" + presentRecord.getIcon()
        }
        freePresents.push(present);
    }
    //lowPriceBuyPresents
    var lowPricePresents = [];
    item.lowPricePresents = lowPricePresents;
    for(var i=0; i<buyItem.getLowPricePresents(); i++){
        var presentRecord = buyItem.getLowPricePresents().get(i);
        var present ={
            ruleId:"" + presentRecord.getRuleId(),
            productId: "" + presentRecord.getProductId(),
            name: "" + presentRecord.getName(),
            number: presentRecord.getNumber(),
            price : "" + presentrecord.getPrice(),
            skuId: "" + presentrecord.getSkuId(),
            icon: "" + presentRecord.getIcon()
        }
        lowPricePresents.push(present);
    }
    return item;
}

function convertDeliveryRuleResult(dr){
    return $.java2Javascript(dr);
}

function convertOcToCart(oc){
    var cart = {};
    cart.merchantId = "" + oc.getMerchantId();
    cart.merchantName = "" + oc.getMerchantName();
    cart.totalOrderProductPrice ="" + oc.getTotalOrderProductPrice().toString();
    cart.totalPayPrice ="" + oc.getTotalPayPrice().toString();
    cart.totalTaxPrice = "" + oc.getTotalTaxPrice().toString();
    cart.totalIntegralPrice =  "" + oc.getTotalIntegralPrice().toString();
    cart.cartId = "" + oc.getCartKey();
    cart.isCrossBorder = oc.isCrossBorder();
    cart.isCollectTax = oc.isCollectTax();


    //freePresents
    var freePresents = [];
    cart.freePresents = freePresents;
    for(var i=0; i<oc.getFreePresents(); i++){
        var presentRecord = oc.getFreePresents().get(i);
        var present ={
            ruleId:"" + presentRecord.getRuleId(),
            productId: "" + presentRecord.getProductId(),
            name: "" + presentRecord.getName(),
            number: "" + presentRecord.getNumber(),
            price : "" + presentRecord.getPrice(),
            skuId: "" + presentRecord.getSkuId(),
            icon: "" + presentRecord.getIcon()
        }
        freePresents.push(present);
    }
    //lowPriceBuyPresents
    var lowPricePresents = [];
    cart.lowPricePresents = lowPricePresents;
    $.log("getLowPricePresents:" + oc.getLowPricePresents().size() + "\n\n");
    var nativeLowPricePresents = oc.getLowPricePresents();
    for(var i=0; i<nativeLowPricePresents.size(); i++){
        var presentRecord = nativeLowPricePresents.get(i);
        var present ={
            ruleId:"" + presentRecord.getRuleId(),
            productId: "" + presentRecord.getProductId(),
            name: "" + presentRecord.getName(),
            number: "" + presentRecord.getNumber(),
            price : "" + presentRecord.getPrice(),
            skuId: "" + presentRecord.getSkuId(),
            icon: "" + presentRecord.getIcon()
        }
        lowPricePresents.push(present);
    }

    var availableRuleResults = [];
    cart.availableRuleResults = availableRuleResults;
    for(var i=0; i<oc.getAvailableRuleResults().size();i++){
        var availableRuleResult = oc.getAvailableRuleResults().get(i);
        var ruleResult = {};
        ruleResult.ruleId = "" + availableRuleResult.getRuleId();
        ruleResult.ruleName = "" + availableRuleResult.getRuleName();
        ruleResult.type = "" + availableRuleResult.getType();
        ruleResult.actionType = "" + availableRuleResult.getActionType();
        var userFriendlyMessages = [];
        for(var j=0; j<availableRuleResult.getUserFriendlyMessages().size(); j++){
            userFriendlyMessages.push("" + availableRuleResult.getUserFriendlyMessages().get(j));
        }
        ruleResult.userFriendlyMessage = userFriendlyMessages.join(";");
        if(ruleResult.type=="olpbr" || ruleResult.type=="plpbr" || ruleResult.type=='ppr' || ruleResult.type=='opr'){
            var availablePresents = availableRuleResult.getAvailablePresents();
            var presents = [];
            for(var j=0; j<availablePresents.size();j++){
                var p = availablePresents.get(j);
                var present = {
                    icon:"" + p.getIcon(),
                    name:"" + p.getName(),
                    number:"" + p.getNumber(),
                    price:"" + p.getPrice(),
                    productId:"" + p.getProductId(),
                    skuId:"" + p.getSkuId(),
                    realSkuId:"" + p.getRealSkuId(),
                    needChooseSku:p.getSkus()!=null && p.getSkus().size()>1
                }
                if(ruleResult.type=="olpbr"){
                    var found = false;
                    cart.lowPricePresents.forEach(function(p){
                        if(p.ruleId==ruleResult.ruleId && p.productId==present.productId){
                            if(present.skuId && present.skuId!='null'){
                                if(present.skuId==p.skuId){
                                    found=true;
                                }
                            }
                            else{
                                found = true;
                            }
                        }
                    });
                    if(found){
                        present.selected = true;
                    }
                    else{
                        present.selected = false;
                    }
                }
                if(ruleResult.type=='opr'){
                    var found = false;
                    cart.freePresents.forEach(function(p){
                        if(p.ruleId==ruleResult.ruleId && p.productId==present.productId){
                            if(present.skuId && present.skuId!='null'){
                                if(present.skuId==p.skuId){
                                    found=true;
                                }
                            }
                            else{
                                found = true;
                            }

                        }
                    });
                    if(found){
                        present.selected = true;
                    }
                    else{
                        present.selected = false;
                    }
                }
                presents.push(present);
            }
            ruleResult.availablePresents = presents;
            ruleResult.amount = availableRuleResult.getAmount();
            try{
              ruleResult.leftNumber = availableRuleResult.getLeftNumber();
            }
            catch(e){

            }


        }
        availableRuleResults.push(ruleResult);
    }

    var buyItems = [];
    for(var i=0; i<oc.getBuyItems().size();i++){
        var buyItem = oc.getBuyItems().get(i);
        var item = convertBuyItem(buyItem);
        buyItems.push(item);
    }

    var availableDeliveryRuleResults = [];
    try{
        for(var i=0; i<oc.getAvailableDeliveryRuleResults().size();i++){
            var deliveryRuleResult = oc.getAvailableDeliveryRuleResults().get(i);
            availableDeliveryRuleResults.push(convertDeliveryRuleResult(deliveryRuleResult))
        }
    }
    catch(e){}

    try{
        cart.finalPayAmount = Number("" + oc.getFinalPayAmount().toString());
    }catch(e){}
    cart.availableDeliveryRuleResults = availableDeliveryRuleResults;
    cart.selectedDeliveryRuleId = "" + oc.getSelectedDeliveryRuleId();
    cart.selectedDeliveryRuleResult = convertDeliveryRuleResult(oc.getSelectedDeliveryRuleResult())
    cart.buyItems = buyItems;
    var totalPayPrice = 0;
    buyItems.forEach(function(item){if(item.checked){totalPayPrice += Number(item.totalPayPrice)}});
    cart.totalOrderProductPrice = totalPayPrice;

    cart.totalDeliveryFee = "" + oc.getTotalDeliveryFee();
    cart.totalPayPrice = Number(totalPayPrice) + Number(cart.totalDeliveryFee);
    cart.crossBorder = oc.getIsCrossBorder();
    return cart;
}