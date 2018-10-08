//#import Util.js
//#import cart.js

var cartId=$.params.cartId;
var itemId=$.params.itemId;
var selectedRuleIds = $.params.selectedRuleIds;
var deniedRuleIds = $.params.deniedRuleIds;

var selectedRuleIdsArray = [];
var deniedRuleIdsArray = [];
if(selectedRuleIds) {
    selectedRuleIdsArray = selectedRuleIds.split(",");
}
if(deniedRuleIds){
    deniedRuleIdsArray = deniedRuleIds.split(",");
}

if(itemId){
    CartService.setBuyItemSelectedRules(cartId,itemId,selectedRuleIdsArray,deniedRuleIdsArray);
}
else{
    CartService.setCartSelectedRules(cartId,selectedRuleIdsArray,deniedRuleIdsArray);
}

out.print(JSON.stringify({
    state:'ok'
}));