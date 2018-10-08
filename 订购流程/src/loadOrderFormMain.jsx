var AppConfig = {
url: "",
getUserUrl:'/buyflowApp/server/getUser.jsx',
selectRulesUrl: "/buyflowApp/server/selectRules.jsx",
selectOrderRuleUrl: "/buyflowApp/server/selectOrderRuleForItem.jsx",
setCheckedItemsUrl:"/buyflowApp/server/setCheckedItems.jsx",
orderFormPageUrl:"/buyflowApp/orderForm.jsx",
orderFormUrl:"/buyflowApp/server/order/orderForm.jsx",
saveAddressUrl: "/buyflowApp/server/order/saveAddress.jsx",
addressListUrl : "/buyflowApp/server/order/addressList.jsx",
deleteAddressUrl:"/buyflowApp/server/order/deleteAddress.jsx",
updateAddressUserNameUrl:"/buyflowApp/server/order/updateAddressUserName.jsx",
getInvoiceListUrl:"/buyflowApp/server/order/getInvoiceList.jsx",
deleteInvoiceUrl:"/buyflowApp/server/order/deleteInvoice.jsx",
saveInvoiceUrl:"/buyflowApp/server/order/saveInvoice.jsx",
saveSelectedPaymentUrl:"/buyflowApp/server/order/saveSelectedPayment.jsx",
setDefaultInvoiceUrl:"/buyflowApp/server/order/setDefaultInvoice.jsx",
setDefaultAddressUrl:"/buyflowApp/server/order/setDefaultAddress.jsx",
addOrderUrl : "/buyflowApp/server/order/addOrder.jsx",
getFreeCardList:"/buyflowApp/server/getFreeCardList.jsx",
sonAddOrderUrl : "/ewjAppTemplate/serverHandlers/sonAddOrder.jsx",
setSelectedDeliveryRuleUrl : "/buyflowApp/server/order/setSelectedDeliveryRule.jsx",
saveSelectedPaymentAndDeliveryRuleUrl : "/buyflowApp/server/order/saveSelectedPaymentAndDelivery.jsx",
setLowPricePresentUrl:"/buyflowApp/server/setLowPricePresent.jsx",
getRegionLevelsUrl:"/buyflowApp/server/order/getRegionLevels.jsx",
getRegionChildrenUrl:"/buyflowApp/server/order/getRegionChildren.jsx",
getSkusUrl:"/buyflowApp/server/getSkus.jsx",
setCartSkuUrl:"/buyflowApp/server/setCartSku.jsx",
getServerTimeUrl:"buyflowApp/server/getServerTime.jsx",
payUrl : "pages/payOrders.jsx",
jiaJuQuanPayUrl : "/buyflowApp/pages/jiaJuQuanPayOrders.jsx",
cartUrl : "/cart.html",
loginUrl : "/login/sign_in.jsp?redirectURL="+ location.href,
spec:"80X80",
leftCashPayAmount:0
};
/**
* Created by Administrator on 14-1-24.
*/
//与属性相关的类，方法等等
function StandardValue(sv){
var self = this;
self.id = ko.observable(sv.id);
self.name = ko.observable(sv.name);
self.value = ko.observable(sv.value);
self.selected = ko.observable(false);
self.enabled = ko.observable(false);
}

function InventoryAttr(inventoryAttr){
var self = this;
self.name = ko.observable(inventoryAttr.name);
self.type = ko.observable(inventoryAttr.type);
self.id = ko.observable(inventoryAttr.id);
self.userOperation = ko.observable(inventoryAttr.userOperation);

var svs = inventoryAttr.standardValues.map(function(sv){
return new StandardValue(sv);
});

self.standardValues = ko.observableArray(svs);
self.getSelectedValue = function(){
for(var i=0; i<self.standardValues().length; i++){
var sv = self.standardValues()[i];
if(sv.selected()){
return sv.id();
}
}
return null;
}
}


function Sku(sku){
var self = this;
self.id = ko.observable(sku.id);
self.skuId = ko.observable(sku.skuId);
self.isHead = ko.observable(sku.isHead);
self.attrs =sku.attrs;
}

function SkuSelector(){
var self = this;
self.inventoryAttrs = ko.observableArray();
self.skus = ko.observableArray();
self.init = function(skus,inventoryAttrs){
self.skus([]);
if(skus){
self.skus (skus.map(function(sku){
return new Sku(sku);
}));
}

self.inventoryAttrs([]);
if(inventoryAttrs){
self.inventoryAttrs (inventoryAttrs.map(function(attr){
return new InventoryAttr(attr);
}));
}
self.enableAttrs();
}

self.getInventoryAttr = function(attrId){
for(var i=0; i<self.inventoryAttrs().length; i++){
var attr = self.inventoryAttrs()[i];
if(attr.id()==attrId){
return attr;
}
}
return null;
}

self.selectedSkuId = function(){
if(self.skus().length==1){
return self.skus()[0].id;
}
for(var i=0; i<self.skus().length; i++){
var sku = self.skus()[i];
if(!sku.attrs || sku.isHead()){
continue;
}
var isMatch = true;
for(k in sku.attrs){
var attrId = k;
var attrValue = sku.attrs[k];
var inventoryAttr = self.getInventoryAttr(attrId);
if(!inventoryAttr){
isMatch = false;
break;
}
if(!inventoryAttr.getSelectedValue() ||  inventoryAttr.getSelectedValue()!=attrValue){
isMatch = false;
break;
}
}
if(isMatch){
return sku.id();
}
}
return null;
};

/*private*/
self.getValidSkus= function(curAttrId){
//获得已经选过的属性以后，还能满足条件的所有 skus,排除curAttrId
var leftSkus = self.skus();
var validSkus = [];
self.inventoryAttrs().forEach(function(inventoryAttr){
if(inventoryAttr.id()==curAttrId){
return;
}
var v = inventoryAttr.getSelectedValue();
if(!v){return;}
leftSkus.forEach(function(sku){
if(sku.attrs && sku.attrs[inventoryAttr.id()] && sku.attrs[inventoryAttr.id()]==v){
validSkus.push(sku);
}
});
leftSkus = validSkus;
validSkus = [];
});
return leftSkus;
}
self.enableAttrs = function(){
self.inventoryAttrs().forEach(function(inventoryAttr){
var curAttrId = inventoryAttr.id();
var skus = self.getValidSkus(curAttrId);
inventoryAttr.standardValues().forEach(function(sv){
//遍历每个剩下的sku,如果某个sku有这个属性，则这个属性可以enable
sv.enabled(false);
for(var i=skus.length-1; i>=0; i--){
var sku = skus[i];
if(!sku.attrs){
continue;  //这是 headSku
}
var v = skus[i].attrs[curAttrId];
if(sv.id() == v){
sv.enabled(true);
}
}
});
});
}
self.selectValue = function(sv,attr){
if(sv.enabled()==false){
return;
}
attr.standardValues().forEach(function(curSv){
curSv.selected(false);
});
sv.selected(true);
self.enableAttrs();
}

self.shouldChooseSku= ko.computed(function(){
if(self.skus().length>1){
return true;
}
else{
return false;
}
});



}
function SkuSelectorDialog(){
var self = this;
self.layerIndex = null;
self.skuSelector = new SkuSelector();
self.callback = null;
self.ok = function(){
if(self.callback){
self.callback(self.skuSelector.selectedSkuId());
}
//$("#skuSelector").foundation("reveal","close");
if(self.layerIndex){
layer.close(self.layerIndex);
}
}
self.cancel = function(){
$("#skuSelector").foundation("reveal","close");
}
self.setCallback = function(callback){
self.callback = callback;
}
self.open = function(title){
self.layerIndex = $.layer({
type:1,
title:'商品：' + title,
offset:['150px',''],
area:['700px','500px'],
page:{
dom:'#skuSelector'
}

});
//$("#skuSelector").foundation("reveal","open");
}
self.init = function(skus,inventoryAttrs,callback){
self.skuSelector.init(skus,inventoryAttrs);
self.setCallback(callback);
}
}

/*var skuSelectorDialog = null;
$(document).ready(function(){
skuSelectorDialog = new SkuSelectorDialog();
ko.applyBindings(skuSelectorDialog,document.getElementById("skuSelector"));
});*/

var skuSelectorDialog=null;
$(document).on("koInit",function(event,extraParams){
var elem = document.getElementById("skuSelector");
if(elem){
skuSelectorDialog = new SkuSelectorDialog();
ko.applyBindings(skuSelectorDialog,elem);
}

});
/**
* Created by Administrator on 2014/6/11.
*/

var BuyFlowUtils = {
pendingItems:[],
selectProducts : function(){
productSelector.openSelectProductView(function(selectedItems){
var items = ko.mapping.toJS(selectedItems);

var pendingItems = [];
//遍历items,如果没有多sku的情况，则加入购物车
items.forEach(function(item){
if(item.hasMultiSkus){
pendingItems.push(item);
}
else{
var params = {productId:item.id}
$.post(AppConfig.url+"server/addToCart.jsx",params,function(ret){
if(ret.state=='ok'){
cartsPage.loadCarts();
}
else{
layer.alert("出错了！" + ret.msg);
}

},"JSON");
}
BuyFlowUtils.pendingItems = pendingItems;
if(BuyFlowUtils.pendingItems.length>0){
BuyFlowUtils.resolvePendingItems();
}
});
});
},

resolvePendingItems:function() {
if(BuyFlowUtils.pendingItems.length>0){
var item = BuyFlowUtils.pendingItems.shift();
BuyFlowUtils.selectSkus(item.id,item.name);
}
},
addToCart:function(productId,skuId){
var params = {productId:productId,skuId:skuId};
$.post(AppConfig.url+"server/addToCart.jsx",params,function(ret){
if(ret.state=='ok'){
cartsPage.loadCarts();
}
else{
layer.alert("出错了。" + ret.msg);
}

},"JSON");
},
selectSkus:function (productId,productName){
$.post(AppConfig.url+"server/getSkus.jsx",{id:productId},function(ret){
if(ret.state=='ok'){
if(ret.skus.length==1){
var sku = ret.skus[0];
}
else{
skuSelectorDialog.init(ret.skus,ret.inventoryAttrs,function(skuId){
BuyFlowUtils.addToCart(productId,skuId);
BuyFlowUtils.resolvePendingItems();
});
skuSelectorDialog.open(productName);
}
}
else{
layer.alert("出错了！" + ret.msg);
}
},"JSON");
},
selectSkuEx:function (productId,productName,callback){
$.post(AppConfig.url + AppConfig.getSkusUrl,{id:productId},function(ret){
if(ret.state=='ok'){
if(ret.skus.length==1){
var sku = ret.skus[0];
}
else{
skuSelectorDialog.init(ret.skus,ret.inventoryAttrs,function(skuId){
callback(skuId);
});
skuSelectorDialog.open(productName);
}
}
else{
layer.alert("出错了！" + ret.msg);
}
},"JSON");
}
};
/**
* 删除左右两端的空格
*/
String.prototype.trim=function(){
return this.replace(/(^\s*)|(\s*$)/g, '');
};
/**
* Created by Administrator on 2014/6/20.
*/
function RuleResult(data) {
var self = this;
self.id = data.id;
self.ruleId = data.ruleId;
self.ruleName = data.ruleName;
self.recommendString = data.recommendString();

self.excludedRuleIds = data.excludedRuleIds;
self.name = data.name;
self.userFriendlyMessages = ko.observableArray(data.userFriendlyMessages);
self.checked = ko.observable(false);
self.executable = ko.observable(data.executable);
self.applied = ko.observable(data.applied);
if (data.applied) {
self.checked(true);
}
self.userFriendlyMessageString = ko.computed(function () {
if (self.userFriendlyMessages()) {
var msg = self.userFriendlyMessages().join(";");
return msg;
}
return self.name;
});
}

function ConsigneeAddress(param) {
param = param || {};
var self = this;
this.id = ko.observable(param.id);
this.isDefault = ko.observable(true);
this.regionName = ko.observable(param.regionName);
this.regionId = ko.observable(param.regionId);
this.mobile = ko.observable(param.mobile);
this.userName = ko.observable(param.userName);
this.address = ko.observable(param.address);
this.certificate = ko.observable(param.certificate || "");
this.postalCode = ko.observable(param.postalCode);
this.fullAddress = ko.computed(function () {
return self.regionName() + self.address();
});
this.selected = ko.observable(false);
//是否e刻达
this.showInFastDelivery = ko.observable(true);
//    if(AppConfig.isFastDelivery){
//        this.showInFastDeliveryC = ko.dependentObservable(function(){
//            $.post(AppConfig.baseUrl+"phone_page/checkRange.jsp",{
//                               merchantId:AppConfig.merchantId,
//                                address: this.fullAddress()
//                            }, function(data){
//                                self.showInFastDelivery(data.status == 'ok');
//                            },"json"
//                   );
//
//        },self);
//    }
}

function DeliveryRuleResult(data) {
var self = this;
data = data || {};

self.name = ko.observable(data.name);
self.ruleId = ko.observable(data.ruleId);
self.description = ko.observable(data.description);
self.remark = ko.observable(data.remark);
self.totalPriceString = ko.observable(data.totalPriceString);
self.totalPrice = ko.observable(data.totalPrice);
self.moneyTypeName = ko.observable(data.moneyTypeName);
self.groupon = ko.observable(data.groupon);
self.supportDP = ko.observable(data.supportDP);
self.enableCOD = ko.observable(data.enableCOD);
//self.availableDeliveryPoints = ko.observable(data.availableDeliveryPoints);
self.availableDeliveryPoints = ko.observable($.map(data.availableDeliveryPoints || [], function (r) {
return new DeliveryPoint(r);
}));
self.selectedDeliveryPointId = ko.observable(data.selectedDeliveryPointId);
self.deliveryWayId = ko.observable(data.deliveryWayId);
self.deliveryWayDescription = ko.observable(data.deliveryWayDescription);

if (self.supportDP()) {
self.deliveryPointSelector = new DeliveryPointSelector(data);
self.deliveryPointSelector.setDeliveryPointList(self.availableDeliveryPoints());
self.deliveryPointSelector.loadRegion(data.deliveryPointRegionId);
self.deliveryPointRegionId = ko.computed(function () {
return self.deliveryPointSelector.deliveryPointRegionId();
});
}
}

//配送时间
function DeliveryTime(data) {
var self = this;
data = data || {};
self.id = ko.observable(data.id);
self.name = ko.observable(data.name);
}
function DeliveryPoint(data) {
var self = this;
data = data || {};
self.id = ko.observable(data.id);
self.name = ko.observable(data.name);
self.address = ko.observable(data.address);
self.deliveryRuleId = ko.observable(data.deliveryRuleId);
self.selected = ko.observable(data.selected);
self.fee = ko.observable(data.fee);
self.phone = ko.observable(data.phone);
}

function Invoice(invoice) {
var self = this;
invoice = invoice || {};
self.id = ko.observable(invoice.id);
self.invoiceTitle = ko.observable(invoice.invoiceTitle || "无需发票");
self.invoiceTypeKey = ko.observable(invoice.invoiceTypeKey || "com"); //com代表普通发票,vat代表增值税发票,默认普通发票
self.invoiceContent = ko.observable(invoice.invoiceContent || "");
self.invoicePostAddress = ko.observable("");
self.orderForm = ko.observable();
self.invoiceNote = ko.computed(function () {
var orderForm = self.orderForm();
if(!orderForm){
return "";
}
if (orderForm.isCrossBorder()) {
return "备注:跨境商品不开发票";
}
});
self.invoiceTypeName = ko.computed(function () {
//com代表普通发票,vat代表增值税发票,默认普通发票
if (!self.invoiceTypeKey() || self.invoiceTypeKey() == "com") {
return "普通发票";
} else {
return "增值税发票";
}
});
self.shortDesc = ko.computed(function () {
if (self.invoiceTitle() == "无需发票") {
return "" + self.invoiceTitle();
} else {
return "" + self.invoiceTitle() + "&nbsp;" + self.invoiceContent();
}
});
}
function Payment(data) {
var self = this;
data = data || {};
self.id = ko.observable(data.id);
self.name = ko.observable(data.name);
self.payInterfaceId = ko.observable(data.payInterfaceId);
}
function BuyItem(data) {
var self = this;
data = data || {};
self.icon = ko.observable(data.icon);
self.productId = ko.observable(data.productId);
self.columnId = ko.observable(data.columnId);
self.columnIds = ko.observable(data.columnIds);
self.productName = ko.observable(data.productName);
self.number = ko.observable(data.number);
self.unitPrice = ko.observable(data.unitPrice);
self.totalPrice = ko.observable(data.totalPrice);
self.unitDealPrice = ko.observable(data.unitDealPrice);
/*满减后的成交价*/
self.totalDealPrice = ko.observable(data.totalDealPrice);
/*满减后的商品总成交价*/
self.totalPrice = ko.observable(data.totalPrice);
self.totalPayPrice = ko.observable(data.totalPayPrice);
self.taxPrice = ko.observable(data.taxPrice);
/*单个商品税*/
self.totalTaxPrice = ko.observable(data.totalTaxPrice);
/*商品行总税*/
self.totalDiscount = ko.observable(data.totalDiscount);
/*商品满减金额*/
self.totalWeight = ko.observable(data.totalWeight / 1000);
self.skuId = ko.observable(data.skuId);
self.itemId = ko.observable(data.itemKey);
self.cartId = ko.observable(data.cartId);
self.readableAttributes = ko.observableArray(data.readableAttributes);
self.attrsString = ko.observable(data.attrsString);
self.checked = ko.observable(true);
self.selectedOrderRuleId = ko.observable(data.selectedOrderRuleId);
self.orderAvailableRules = ko.observableArray(data.orderAvailableRules || []);
self.orderInclusiveRules = ko.computed(function () {
var rules = [];
$.each(self.orderAvailableRules(), function (idx, rule) {
if (!rule.excludeOtherOrderRule == true) {
rules.push(rule);
}
});
return rules;
});
/*与其他规则互斥的规则*/
self.excludeOtherOrderRule = ko.computed(function () {
var rules = [];
$.each(self.orderAvailableRules(), function (idx, rule) {
if (rule.excludeOtherOrderRule == true) {
rules.push(rule);
}
});
return rules;
});
self.integralPrice = ko.observable(data.integralPrice || 0);
self.totalIntegralPrice = ko.observable(data.totalIntegralPrice || 0);
self.objType = ko.observable(data.objType);

if (data.hasOwnProperty("checked")) {
self.checked(data.checked);
}
self.checked.subscribe(function (newValue) {
cartsPage.setCheckedItems();
});
self.toggle = function () {
self.checked(!self.checked());
};
self.acceptedNumber = ko.computed({
read: self.number,
write: function (value) {
if (isNaN(value)) {
var oldValue = self.number();
this.number(0);
this.number(oldValue);
layer.alert("购买数量必须是数字。")
}
else {
this.number(value); // Write to underlying storage
cartsPage.changeNumber(self, value);
}
},
owner: this
});
var ruleTarget = new RuleTarget(data);
$.extend(self, ruleTarget);
/*这个商品行的折扣（含单品满减与订单满减的平摊值）*/
self.totalDiscount = ko.computed(function () {
return self.totalPrice() - self.totalDealPrice();
});

//组合商品
self.isFreeGroupProduct = data.freeGroupProduct;
self.isCombiProduct = data.combiProduct;
self.combiItems = data.combiItems;
if (data.combiItems) {
$.each(data.combiItems, function (idx, item) {
item.totalWeight = item.totalWeight / 1000;
item.totalWeight = Number(item.totalWeight).toFixed(2);
});
}
}

function Oc(oc) {
var self = this;
oc = oc || {};
//配送方式
self.selectedDeliveryRule = ko.observable(null);
self.selectedDeliveryRuleId = ko.observable();
self.selectedDeliveryRuleName = ko.observable("");
self.selectedDeliveryRulePrice = ko.observable("");
self.selectedDeliveryRuleMoneyType = ko.observable("");
self.selectedDeliveryRuleEnableCod = ko.observable(false);
//自提点
self.selectedDeliveryPointId = ko.observable(oc.selectedDeliveryPointId || "");
self.selectedDeliveryPointName = ko.observable("");

self.allCardBatches = oc.allCardBatches;
self.availableRuleResults = oc.availableRuleResults;
self.isCrossBorder = oc.crossBorder;/*是否跨境订单*/
self.isCrossDirectMail = oc.crossDirectMail;/*是否跨境直邮订单*/
self.isFastDelivery = oc.isFastDelivery; // 万家送
self.isB2BOrder = oc.isB2BOrder;//是否b2b商家
self.isCollectTax = oc.collectTax;/*是否收税*/
//配送时间
self.selectedDeliveryTimeId = ko.observable("");
self.selectedDeliveryTimeName = ko.observable("");
//是否支持积分、购物券等支付方式
self.supportIntegral = oc.supportIntegral;
self.supportStoreCard = oc.supportStoreCard;
self.supportPreDeposit = oc.supportPreDeposit;
self.supportTicket = oc.supportTicket;
self.supportJiaJuQuan = oc.supportJiaJuQuan;

self.merchantId = ko.observable(oc.merchantId);
self.cartId = oc.cartKey;
self.cartType = oc.cartType;
self.merchantName = ko.observable(oc.merchantName);

self.hasDeliveryRule = ko.observable(false);

// 万家送自提点特别一点，要层层往下传直到selector
self.wjsDeliveryPoints = ko.observable();
self.wjsDeliveryPoints.subscribe(function () {
self.deliveryResults().forEach(function (value) {
if(value.supportDP()&& value.deliveryPointSelector){
value.deliveryPointSelector.setDeliveryPointList(self.wjsDeliveryPoints());
value.availableDeliveryPoints(self.wjsDeliveryPoints());
}
});
});

self.setDeliveryPoint = function (deliveryPoint) {
if (deliveryPoint) {
self.selectedDeliveryPointId(deliveryPoint.id());
self.selectedDeliveryPointName(deliveryPoint.name());
} else {
self.selectedDeliveryPointId("");
self.selectedDeliveryPointName("");
}
return true;
};
self.selectedDeliveryPointRegionId = ko.computed(function () {
var selectedDeliveryRule = self.selectedDeliveryRule();
if (selectedDeliveryRule && selectedDeliveryRule != null && selectedDeliveryRule.deliveryPointRegionId) {
return selectedDeliveryRule.deliveryPointRegionId();
} else {
return "";
}
});
self.setDeliveryRule = function (rule) {
if (rule) {
self.selectedDeliveryRule(rule);
self.selectedDeliveryRuleId(rule.ruleId());
self.selectedDeliveryRuleName(rule.name());
self.selectedDeliveryRulePrice(rule.totalPriceString());
self.selectedDeliveryRuleMoneyType(rule.moneyTypeName());
self.selectedDeliveryRuleEnableCod(rule.enableCOD());
if (rule.supportDP()) {

if (rule.availableDeliveryPoints().length == 1) {
self.setDeliveryPoint(rule.availableDeliveryPoints()[0]);
} else {
var dp = null;
$.each(rule.availableDeliveryPoints(), function (idx, deliveryPoint) {
if (deliveryPoint.id() == self.selectedDeliveryPointId()) {
dp = deliveryPoint;
}
});
if (dp == null) {
if (!self.isFastDelivery && !self.selectedDeliveryRule().supportDP()) {
self.setDeliveryPoint(null);
}
}
else {
self.setDeliveryPoint(dp);
}
}
}
}
else {
self.selectedDeliveryRule(null);
self.selectedDeliveryRuleId("");
self.selectedDeliveryRuleName("");
self.selectedDeliveryRulePrice("");
self.selectedDeliveryRuleMoneyType("");
self.selectedDeliveryRuleEnableCod(false);
}
return true;
};

self.selectDeliveryRule = function (ruleId) {
if (!self.deliveryResults()) {
self.setDeliveryRule(null);
return;
}
if (!ruleId) {
self.setDeliveryRule(null);
return;
}
var r = null;
$.each(self.deliveryResults(), function (idx, rule) {
if (rule.ruleId() == ruleId) {
r = rule;
}

});
if (r == null) {
self.setDeliveryRule(null);
}
else {
self.setDeliveryRule(r);
}
};
self.setDeliveryTime = function (rule) {
if (rule) {
self.selectedDeliveryTimeId(rule.id());
self.selectedDeliveryTimeName(rule.name());
} else {
self.selectedDeliveryTimeId("");
self.selectedDeliveryTimeName("");
}
return true;
};

self.selectDeliveryTime = function (ruleId) {
if (!self.deliveryTimes()) {
self.setDeliveryTime(null);
return;
}
if (!ruleId) {
self.setDeliveryTime(null);
return;
}
var r = null;
$.each(self.deliveryTimes(), function (idx, rule) {
if (rule.id() == ruleId) {
r = rule;
}

});
if (r == null) {
self.setDeliveryTime(null);
}
else {
self.setDeliveryTime(r);
}
};

try {
self.totalOrderProductPrice = ko.observable(oc.totalOrderProductPrice);//商品金额
self.totalIntegralPrice = ko.observable(oc.totalIntegralPrice || 0);//积分金额
self.totalDeliveryFee = ko.observable(oc.totalDeliveryFee);//运费
self.totalProductDiscount = ko.observable(oc.totalProductDiscount);//商品优惠
self.totalOrderDiscount = ko.observable(oc.totalOrderDiscount);//订单优惠
self.totalDeliveryFeeDiscount = ko.observable(oc.totalDeliveryFeeDiscount);//运费优惠
self.finalPayAmount = ko.observable(oc.finalPayAmount);//需支付金额
self.totalTaxPrice = ko.observable(oc.totalTaxPrice);//税金
self.paymentList = ko.observable(oc.paymentList || []);
self.selectedPaymentId = ko.observable(oc.selectedPaymentId);
self.selectedPayment = ko.computed(function () {
var payment = null;
if (!self.paymentList()) {
return null;
}
$.each(self.paymentList(), function (idx, p) {
if (p.id == self.selectedPaymentId()) {
payment = p;
}
});
return payment;
});
self.finalNeedPayAmount = ko.observable(oc.finalNeedPayAmount);
self.selectedPayInterfaceId = ko.observable(oc.selectedPayInterfaceId);

self.deliveryResults = ko.observable($.map(oc.availableDeliveryRuleResults || [], function (r) {
r.deliveryPointRegionId = oc.deliveryPointRegionId;
r.merchantId = oc.merchantId;
return new DeliveryRuleResult(r);
}));

var deliveryResultsLength = self.deliveryResults().length;
if (deliveryResultsLength == 0) {
self.hasDeliveryRule(false);
} else if (deliveryResultsLength == 1) {
self.setDeliveryRule(self.deliveryResults()[0]);
self.hasDeliveryRule(true);
} else {
self.selectDeliveryRule(oc.selectedDeliveryRuleId);
self.hasDeliveryRule(true);
}
console.log("aaaa="+self.hasDeliveryRule());

self.deliveryTimes = ko.observable($.map(oc.availableDeliveryTimes || [], function (r) {
return new DeliveryTime(r);
}));

if (self.deliveryTimes().length == 1) {
self.setDeliveryTime(self.deliveryTimes()[0]);
} else {
self.selectDeliveryTime(oc.selectedDeliveryTime);
}
}
catch (e) {
//console.log(e);
}


//获得商品数量
if (oc.buyItems) {
var items = $.map(oc.buyItems, function (item, i) {
var item = new BuyItem(item);
return item;
});
self.buyItems = ko.observableArray(items);
}
else {
self.buyItems = ko.observableArray([]);
}

self.isEmpty = ko.computed(function () {
var empty = true;
$.each(self.buyItems(), function (idx, item) {
if (item.checked()) {
empty = false;
}
});
return empty;
});

self.totalProductNumber = ko.computed(function () {
var total = 0;
$.each(self.buyItems(), function (i, buyItem) {
total += buyItem.number();
});
return total;
});
/*是否需要支付税金*/
self.needPayTax = ko.computed(function () {
return self.totalTaxPrice() > AppConfig.maxTaxPrice;
});
}
function RuleSelectorDialog() {
var self = this;
self.availableRuleResults = ko.observableArray([]);
self.callBack = null;
self.layerIndex = null;
self.setAvailableRuleResults = function (ruleResults) {
self.availableRuleResults($.map(ruleResults, function (result) {
return new RuleResult(result);
}));

}

self.show = function (ruleResults, callBack) {
if (!ruleResults) {
return;
}
self.callBack = callBack;
self.setAvailableRuleResults(ruleResults);
if($.layer){
self.layerIndex = $.layer({
type: 1,
area: ['600px', '500px'],
offset: ['100px', ''],
page: {dom: '#ruleSelectorDialog'}
}
);
}
else{
$('#ruleSelectorDialog').show(300);
}

}

self.ok = function () {
if($.layer){
layer.close(self.layerIndex);
}
else{
$('#ruleSelectorDialog').hide(300);
}
if (self.callBack) {
self.callBack(self.availableRuleResults());
}
}
self.close = function(){
if($.layer){
layer.close(self.layerIndex);
}
else{
$('#ruleSelectorDialog').hide(300);
}
}

self.recalculateExclude = function (ruleResult) {
if (!ruleResult.checked()) {
return true;
}
if (!ruleResult.excludedRuleIds) {
return true;
}
$.each(ruleResult.excludedRuleIds, function (index, excludedId) {
if (self.availableRuleResults()) {
$.each(self.availableRuleResults(), function (index, result) {
if (result.ruleId == excludedId) {
result.checked(false);
}
});
}
});
return true;
}
}
var ruleSelectorDialog = new RuleSelectorDialog();
$(document).on("koInit", function (event, extraParams) {
var root = document.getElementById("ruleSelectorDialog");
if (root) {
ko.applyBindings(ruleSelectorDialog, root);
}

});
/*
$(document).ready(function(){
ko.applyBindings(ruleSelectorDialog,document.getElementById("ruleSelectorDialog"));
});*/

function Option(data){
data = data || {};
var self = this;
self.id = data.id;
self.name = data.name;
}
function OptionLevel(data){
var self = this;
self.onChange = null;

data = data || {};
if(!data.options){
data.options = [];
}
self.options = $.map(data.options,function(option){
return new Option(option);
});
self.currentOptionId = ko.observable(null);
self.currentOptionId(data.currentId);
self.currentOptionId.subscribe(function(newValue) {
if(self.onChange){
self.onChange(self);
}
});
self.currentOption = function(){
for(var i=0;i<self.options.length;i++){
var option = self.options[i];
if(option.id==self.currentOptionId()){
return option;
}
}
return null;
}
self.currentOptionName = function(){
for(var i=0;i<self.options.length;i++){
var option = self.options[i];
if(option.id==self.currentOptionId()){
return option.name;
}
}
return null;
}
self.nextLevel = null;
self.levelIndex = 0;
}

function OptionSelector(){
var self = this;
self.onChangeHandlers = [];
self.registerChangeHandler = function(handler){
self.onChangeHandlers.push(handler);
return self.onChangeHandlers.length-1;
}
self.currentOptionPathName = ko.observable();
self.optionLevels = ko.observableArray();
self.onLevelChange = function(optionLevel){
self.optionLevels.splice(optionLevel.levelIndex+1,self.optionLevels().length -optionLevel.levelIndex-1 );
$.each(self.onChangeHandlers,function(index,handler){
handler(self,optionLevel);
});
self.currentOptionPathName(self.getCurrentOptionPathName());
};
self.setOptionLevels= function(levels){
if(!levels){
levels = [];
}
if(levels.length>0){
var last = levels[levels.length-1];
if(!last.options || last.options.length==0){
levels.pop();
}
}
var  optionLevels = $.map(levels,function(level){
return new OptionLevel(level);
});
for(var i=0;i<optionLevels.length;i++){
var level = optionLevels[i];
var next = null;
if(i<optionLevels.length-1){
next = optionLevels[i+1];
}
level.nextLevel = next;
level.levelIndex = i;
level.onChange = self.onLevelChange;
}
self.optionLevels(optionLevels);
self.currentOptionPathName(self.getCurrentOptionPathName());

}
self.addOptionLevel = function(level){
if(!level || !level.options || level.options.length==0){
return;
}
var optionLevel =  new OptionLevel(level);
var levels = self.optionLevels();
levels.push(optionLevel);
for(var i=0;i<levels.length;i++){
var level = levels[i];
var next = null;
if(i<levels.length-1){
next = levels[i+1];
}
level.nextLevel = next;
level.levelIndex = i;
level.onChange = self.onLevelChange;
}
self.optionLevels(levels);
self.currentOptionPathName(self.getCurrentOptionPathName());
}
self.onNewLevel = function(newOptionLevel){
newOptionLevel.levelIndex = self.optionLevels.length;
self.optionLevels.push(newOptionLevel);
}
self.getCurrentOption = function(){
if(!self.optionLevels() || self.optionLevels().length==0){
return null;
}
var levels = self.optionLevels();
for(var i=levels.length-1; i>=0;i--){
var level = levels[i];
if(level.currentOptionId()){
return level.currentOption();
}
}
}

self.getCurrentOptionId = function(){
if(!self.optionLevels() || self.optionLevels().length==0){
return null;
}
var levels = self.optionLevels();
for(var i=levels.length-1; i>=0;i--){
var level = levels[i];
if(level.currentOptionId()){
return level.currentOptionId();
}
else{
return null;
}
}
}


self.getCurrentOptionPath = function(){
var path = [];
var levels = self.optionLevels();
for(var i=0; i<levels.length;i++){
var level = levels[i];
var currentOption = level.currentOption();
if(currentOption){
path.push(currentOption);
}
else{
break;
}
}
return path;
}
self.getCurrentOptionPathName = function(){
var path = self.getCurrentOptionPath();
var names = [];
$.each(path,function(index,elem){
names.push(elem.name);
});
return names.join("");
}

}


function PresentRecord(data,parent){
data = data || {};
var self = this;
$.extend(self,data);
self.parent = parent;
self.selectedNumber = ko.observable(data.number);
self.checked = ko.observable(data.checked);
self.checked.subscribe(function(newValue){
if(newValue==true){
var remain = self.parent.remainNumber();
if(remain < self.selectedNumber()){
var diff = self.selectedNumber()-remain;
setTimeout(function() {
$.each(self.parent.presents(), function (idx, p) {
if(p.checked() && self.productId!= p.productId){
if(diff>0){
diff = diff - p.selectedNumber();
p.checked(false);
}
}
});
},50);
}
}
});

self.toggle = function(){
var isChecked = self.checked();
self.checked(!isChecked);
}

try{
self.price = data.price.toFixed(2);
}
catch (e){
self.price = "-";
}
}
function LowPricePresentSelector(){
var self = this;
self.allowedNumber = ko.observable(); //允许的数量
self.presents = ko.observableArray();
self.setPresentRecords = function(records){
self.presents(records);
};
self.remainNumber = ko.computed(function(){
var selNum = 0;
$.each(self.presents(),function(idx,present){
if(present.checked()){
selNum+=present.selectedNumber();
}
});
return self.allowedNumber() - selNum;
});
self.callback = null;
self.show = function(presentRecords,allowedNumber,callBack){
if(!presentRecords){
return;
}
self.allowedNumber(allowedNumber);
self.callback = callBack;
self.setPresentRecords($.map(presentRecords,function(present){
var r = new PresentRecord(present,self);
return r;
}));
if($.layer && false){
self.layerIndex = $.layer({
type:1,
title:"请选择换购商品,数量有限换完即止",
area:['600px','500px'],
offset:['100px',''],
page:{dom:'#lowPricePresentSelector'}
}
);
}
else{
$("#lowPricePresentSelector").show(300);
}

}
self.add = function(presentRecord){
if(self.remainNumber()>0 && presentRecord.checked()){
presentRecord.selectedNumber(Number(presentRecord.selectedNumber())+1);
}

}
self.minus = function(presentRecord){
if(presentRecord.checked() && presentRecord.selectedNumber()>1){
presentRecord.selectedNumber(Number(presentRecord.selectedNumber())-1);
}

}
self.ok = function(){
var selectedPresents = [];
$.each(self.presents(),function(idx,present){
if(present.checked()){
selectedPresents.push({
productId:present.productId,
skuId : present.skuId,
number:present.selectedNumber()
})
}
});
if($.layer){
layer.close(self.layerIndex);
}
else{
$("#lowPricePresentSelector").fadeOut(100);
}

if(self.callback){
self.callback(selectedPresents);
}

}
self.close = function(){
$("#lowPricePresentSelector").fadeOut(100);
}

}

var lowPricePresentSelector=null;
$(document).on("koInit",function(event,extraParams){
var root = document.getElementById("lowPricePresentSelector");
if(root){
lowPricePresentSelector = new LowPricePresentSelector();
ko.applyBindings(lowPricePresentSelector,root);
}
});
/*
$(document).ready(function(){
lowPricePresentSelector = new LowPricePresentSelector();
ko.applyBindings(lowPricePresentSelector,document.getElementById("lowPricePresentSelector"));
});*/
function OrderRuleSelector(){
var self = this;
self.rules = ko.observableArray();
self.callBack = null;
self.isShow = ko.observable(false);
self.show = function(rules,selectedRule,callBack){
if(!rules){
return;
}
self.rules(rules);
self.selectedRule(selectedRule);
self.callBack = callBack;
$("#orderRuleSelector").show(200);
}
self.selectedRule = ko.observable();

self.ok = function(){
$("#orderRuleSelector").hide();
if(self.callBack){
self.callBack(self.selectedRule());
}
self.selectedRule(null);
}

self.cancel = function(){
$("#orderRuleSelector").hide();
}
}

var orderRuleSelector = new OrderRuleSelector();
$(document).on("koInit",function(event,extraParams){
var root = document.getElementById("orderRuleSelector");
if(root){
ko.applyBindings(orderRuleSelector,root);
}
});
function ConfirmDialog(){
var self = this;
self.message = ko.observable();
self.okButtonCaption = ko.observable("确定");
self.cancelButtonCaption = ko.observable("取消");
self.callback = ko.observable();
self.showOKbtn = ko.observable(true);
self.showCancelbtn = ko.observable(true);

self.ok = function(){
$("#maskLayer").hide();
$("#confirmDialog").fadeOut(300);
if(self.callback){
self.callback();
}
};

self.cancel = function(){
$("#maskLayer").hide();
$("#confirmDialog").fadeOut(300);
};
self.show = function(message,callback,okButtonCaption, cancelButtonCaption,buttons){
self.callback = callback;
if(okButtonCaption){
self.okButtonCaption(okButtonCaption);
}else{
self.okButtonCaption("确定");
}
if(cancelButtonCaption){
self.cancelButtonCaption(cancelButtonCaption);
}else{
self.cancelButtonCaption("取消");
}
self.message(message);
$("#maskLayer").show();
$("#confirmDialog").fadeIn(300);
//如果有传进来要显示哪些按钮，那就用传进来的配置显示,例:['ok','cancel']
if(buttons){
self.showOKbtn(false);
self.showCancelbtn(false);
for(var i = 0 ;i<buttons.length;i++){
if(buttons[i] == "ok"){
self.showOKbtn(true);
}
if(buttons[i] == "cancel"){
self.showCancelbtn(true);
}
}
}else {
self.showOKbtn(true);
self.showCancelbtn(true);
}
};
}

var confirmDialog=null;
$(document).on("koInit",function(event,extraParams){
var root = document.getElementById("confirmDialog");
confirmDialog = new ConfirmDialog();
if(root){
ko.applyBindings(confirmDialog,root);
}
});
function FreePresent(data){
var self = this;
self.icon = ko.observable(data.icon);
self.name = ko.observable(data.name);
self.skuId = ko.observable(data.skuId);
self.productId = ko.observable(data.productId);
self.number = ko.observable(data.number);
self.ruleId = data.ruleId;
}

function CartRuleTarget(ruleResult,cart){
var self = this;
self.items = [];
self.ruleResult = ruleResult;

$.each(cart.buyItems(),function(idx,item){
console.log("111...item.orderAvailableRules()",item.orderAvailableRules())
if(item.selectedOrderRuleId()==ruleResult.ruleId){
self.items.push(item);
item.chooseOrderRule = function(){
var selectedRule = null;
var rules = [];

$.each(item.orderAvailableRules(),function(idx,rule){
if(rule.excludeOtherOrderRule==true){
rules.push(rule);
}
});
$.each(rules,function(idx,rule){
if(rule.id == ruleResult.ruleId){
selectedRule = rule;
}
});
orderRuleSelector.show(rules,selectedRule,function(rule){
console.log("888888888888888.....=",rules);
var postData={
cartId:cart.cartId(),
itemId:item.itemId(),
ruleId:rule.id
};
$.post(AppConfig.url+AppConfig.selectOrderRuleUrl,postData,function(ret){
if(ret.state=='ok'){
cartsPage.loadCarts();
}
},"JSON");
});
}
}
});
self.userFriendlyMessages = ko.computed(function(){
return self.ruleResult.userFriendlyMessages.join(",");
});

self.isLowPricePresentRule = (self.ruleResult.type=='olpbr');
self.selectedlowPricePresents = ko.computed(function(){
var presents = [];
if( self.ruleResult.type=='olpbr'){
if(cart.lowPricePresents){
$.each(cart.lowPricePresents,function(idx1,selectedPresent){
if(self.ruleResult.ruleId==selectedPresent.ruleId){
presents.push(selectedPresent);
}
});
}
}
return presents;
});
self.chooseLowPriceBuyPresents = function(event){
var presents = [];
$.each(self.ruleResult.availablePresents,function(idx,present){
present.checked = false;
$.each(self.selectedlowPricePresents(),function(idx1,selectedPresent){
if(present.productId==selectedPresent.productId && ruleResult.ruleId==selectedPresent.ruleId){
present.checked = true;
present.number = selectedPresent.number;
}
});
presents.push(present);
});

lowPricePresentSelector.show(presents,self.ruleResult.amount,function(selections){
var postData = {
cartId : cart.cartId(),
ruleId : self.ruleResult.ruleId,
selections:JSON.stringify(selections)
};
$.post(AppConfig.url+AppConfig.setLowPricePresentUrl,postData,function(ret){
if(ret.state == 'ok'){
cartsPage.loadCarts();
}
else{
layer.alert("出错了。" + ret.msg);
}
},"JSON");
});
};

self.isFreePresentRule = (self.ruleResult.type=='opr');
self.freePresents = ko.computed(function(){
var presents = [];
if( self.ruleResult.type=='opr'){
if(cart.freePresents){
$.each(cart.freePresents,function(idx1,present){
if(self.ruleResult.ruleId==present.ruleId){
presents.push(present);
}
});
}
}
return presents;
});
}

function RuleTarget (data){
var self = this;
self.cartId = ko.observable(data.cartId);
self.itemId = ko.observable(data.itemKey);
self.ruleResults = data.executedRuleResults;
self.availableRuleResults = data.availableRuleResults;
self.hasMultiSkus = data.hasMultiSkus;
if(data.freePresents){
self.freePresents = data.freePresents;
}
self.lowPricePresents = data.lowPricePresents;
self.numberOfSelectableRules = ko.computed(function(){
if(!self.availableRuleResults){
return 0;
}
var count = 0;
$.each(self.availableRuleResults,function(index,result){
if(!result.impossible){
count++;
}
});
return count;
});
self.userFriendlyMessages = ko.computed(function(){
if(self.ruleResults){
var msgs = [];
$.each(self.ruleResults,function(index,result){
if(result && result.userFriendlyMessages && result.type!=='plpbr' && result.type!=='olpbr' && result.type!="ppr" && result.type!="opr"){
//msgs.push("[" + result.actionType +"]"+result.userFriendlyMessages);
msgs.push({actionType:result.actionType,msg:result.userFriendlyMessages});
}
});
return msgs;
}
return [];
});
self.getRule = function(presentRecord){
var ruleName = null;
$.each(self.ruleResults,function(index,result){
if(result.ruleId == presentRecord.ruleId){
ruleName = result.rule.name;
}
});
return ruleName;
};

self.chooseRules = function(){
var needUserActionRuleResults = [];
$.each(self.availableRuleResults,function(index,result){
if(!result.impossible){
needUserActionRuleResults.push(result);
}
});
ruleSelectorDialog.show(needUserActionRuleResults,function(ruleResults){
var postData = {};
var selectedRuleIds = [];
var deniedRuleIds = [];
$.each(ruleResults,function(index,elem){
if(elem.checked()){
selectedRuleIds.push(elem.ruleId);
}
else{
deniedRuleIds.push(elem.ruleId);
}
});
postData={
cartId:self.cartId(),
itemId:self.itemId(),
selectedRuleIds:selectedRuleIds.join(","),
deniedRuleIds:deniedRuleIds.join(",")
};
$.post(AppConfig.url+AppConfig.selectRulesUrl,postData,function(ret){
if(ret.state=='ok'){
cartsPage.loadCarts();
}
},"JSON");
});
};

self.lowPricePresentRuleResults = ko.computed(function(){
var ruleResults = [];
$.each(self.ruleResults,function(index,result){
if(result.type=='plpbr' || result.type=='olpbr'){
//低价换购
ruleResults.push(result);
result.selectedPresents = [];
if(self.lowPricePresents){
$.each(self.lowPricePresents,function(idx1,selectedPresent){
if(result.ruleId==selectedPresent.ruleId){
result.selectedPresents.push(selectedPresent);
}
});
}
}
});
return ruleResults;
});

self.chooseLowPriceBuyPresents = function(result){
var presents = [];
$.each(result.availablePresents,function(idx,present){
present.checked = false;
$.each(result.selectedPresents,function(idx1,selectedPresent){
if(present.productId==selectedPresent.productId && result.ruleId==selectedPresent.ruleId){
present.checked = true;
present.number = selectedPresent.number;
}
});
presents.push(present);
});

lowPricePresentSelector.show(presents,result.amount,function(selections){
var postData = {
cartId : self.cartId(),
ruleId : result.ruleId,
itemId:self.itemId(),
selections:JSON.stringify(selections)
};
$.post(AppConfig.url+AppConfig.setLowPricePresentUrl,postData,function(ret){
if(ret.state == 'ok'){
cartsPage.loadCarts();
}
else{
layer.alert("出错了。" + ret.msg);
}
},"JSON");
});
};

}

function getImg(id){
$.post("/buyflowApp/server/getCombiProductImg.jsx",{id:id},function(ret){
if(ret.state=="ok"){
return ret.icon;
}

},'json');
}
function Cart(data) {
var self = this;
self.merchantName = ko.observable(data.merchantName);
self.merchantId = ko.observable(data.merchantId);

self.freeCardList=ko.observableArray([]);//商家提供的可领券的优惠券
self.freeCardShow=ko.observable(false);//优惠券详情是否显示
var items = $.map(data.buyItems, function (item) {
return new BuyItem(item);
});
self.buyItems = ko.observableArray(items);


self.totalOrderProductPrice = ko.observable(data.totalOrderProductPrice);/*商品总金额，未减商品优惠*/
self.totalPayPrice = ko.observable(Number(data.totalPayPrice).toFixed(2));/*商品总金额，已减商品优惠*/
/*商品优惠金额*/
self.totalDiscount = ko.computed(function(){
return (self.totalOrderProductPrice() - self.totalPayPrice()).toFixed(2);
});
self.totalTaxPrice = ko.observable(data.totalTaxPrice);/*购物车总税金*/
//积分价
self.totalIntegralPrice = ko.observable(data.totalIntegralPrice || 0);
//self.totalOrderDiscount = ko.observable(data.totalOrderDiscount);
self.cartId = ko.observable(data.cartKey);
self.isCrossBorder =data.crossBorder || false;/*是否跨境订单*/
self.isCollectTax = data.collectTax;/*是否收税*/
self.isFirstCrossBorder = data.isFirstCrossBorder || false;
data.cartId = data.cartKey;
data.isCart = true;
self.orderRuleTargets=[];
self.lowPricePresents = data.lowPricePresents;
self.freePresents = data.freePresents;
for(var i=0;data.availableRuleResults&&i<data.availableRuleResults.length;i++){
var cartRuleTarget=new CartRuleTarget(data.availableRuleResults[i],self);
if(cartRuleTarget.items.length>0){
self.orderRuleTargets.push(cartRuleTarget);
}
}
$.each(self.orderRuleTargets,function(idx,ruleTarget){
self.buyItems.removeAll(ruleTarget.items);
});

$.each(self.buyItems(),function(idx,item){
item.chooseOrderRule = function(){
var selectedRule = null;
var rules = [];
console.log("item.orderAvailableRules()",item.orderAvailableRules())
$.each(item.orderAvailableRules(),function(idx,rule){
if(rule.excludeOtherOrderRule==true){
rules.push(rule);
}
});
$.each(rules,function(idx,rule){
if(rule.id == item.selectedOrderRuleId()){
selectedRule = rule;
}
});
orderRuleSelector.show(rules,selectedRule,function(rule){
console.log("888888888888888.....=",rules);
var postData={
cartId:self.cartId(),
itemId:item.itemId(),
ruleId:rule.id
};
$.post(AppConfig.url+AppConfig.selectOrderRuleUrl,postData,function(ret){
if(ret.state=='ok'){
cartsPage.loadCarts();
}
},"JSON");
});
};

if(item.isCombiProduct) {
$.post("/buyflowApp/server/getCombiProductImg.jsx", {id: item.productId()}, function (ret) {
if (ret.state == "ok") {
item.icon(ret.icon);
}
}, 'json');

}
});

//获取商家的优惠券信息
self.getFreeCardList=function(merchantId){
$.post(AppConfig.url+AppConfig.getFreeCardList,{mid:merchantId},function(ret){
if(ret.state=='ok'){
self.freeCardList(ret.recordList);
}
},"JSON");
};

//领券
self.getFreeCard=function(card){
$.post(card.coupon,{aid:card.activityId,bid:card.cardBatchId},function(ret){
if(ret.code=="0"){

//alert("已经成功领取优惠券！");
}else{
alert(ret.msg);
}
self.getFreeCardList(card.merchantId);
},"JSON")
};
self.getFreeCardList(self.merchantId);

self.checkedNumber = ko.computed(function(){
var number = 0;
$.each(self.buyItems(), function (idx, item) {
if (item.checked()) {
number += item.acceptedNumber();
}
});

$.each(self.orderRuleTargets,function(idx,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx1,item){
if (item.checked()) {
number += item.acceptedNumber();
}
});
});
return number;
});
self.checkedTotalWeight = ko.computed(function(){
var totalWeight = 0;
$.each(self.buyItems(), function (idx, item) {
if (item.checked()) {
totalWeight += Number(item.totalWeight());
}
});

$.each(self.orderRuleTargets,function(idx,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx1,item){
if (item.checked()) {
totalWeight += Number(item.totalWeight());
}
});
});
return totalWeight.toFixed(2);
});
self.allChecked = ko.computed({
read: function () {
var allChecked = true;
$.each(self.buyItems(), function (idx, item) {
if (!item.checked()) {
allChecked = false;
}
});

$.each(self.orderRuleTargets,function(idx,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx1,item){
if (!item.checked()) {
allChecked = false;
}
});
});
return allChecked;
},
write:function(newValue){
$.each(self.buyItems(), function (idx, item) {
item.checked(newValue);
});

$.each(self.orderRuleTargets,function(idx,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx1,item){
item.checked(newValue);
});
});

}
});
self.allNotChecked = ko.computed(function(){
var allNotChecked = true;
$.each(self.buyItems(), function (idx, item) {
if (item.checked()) {
allNotChecked = false;
}
});

$.each(self.orderRuleTargets,function(idx,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx1,item){
if (item.checked()) {
allNotChecked = false;
}
});
});
return allNotChecked;
});
//点击展示/隐藏优惠券详情
self.showFreeCard=function(card){
$.post(AppConfig.getUserUrl,function(ret){
if(ret.state=="ok"){
self.getFreeCardList(card.merchantId);
self.freeCardShow(!self.freeCardShow());
}else{
window.location.href=AppConfig.loginUrl;
}
},"json")

};
self.toggle = function(){
var allChecked = self.allChecked();
self.allChecked(!allChecked);
};
self.totalProductNumber = ko.computed(function(){
var total = 0;
self.buyItems().forEach(function(value){
total += value.number();
});
self.orderRuleTargets.forEach(function(value){
total += value.items&&value.items.length;
});
return total;
});
/*这个购物车是否需要交税*/
self.needPayTax = ko.computed(function(){
return Number(self.totalTaxPrice()) > Number(AppConfig.maxTaxPrice);
});
}



function PresentSelector(){
var self = this;
self.selectedPresents = ko.observableArray();
self.ruleResult = ko.observable();
self.callback = null;

self.show = function(ruleResult){
self.ruleResult(ruleResult,position);
};
self.ok = function(){
self.callback(selectedPresents);
}
}

function Carts(ocs) {
var self = this;
self.mids = ko.observable();
self.buyerUserId = ko.observable("");
self.readOnly = ko.observable(false);
self.isLogin = ko.observable(true);
self.initialized = false;
self.isLoadingData = false;
self.toggleAllChooseAction = ko.observable(false);//是否全选操作
self.toggleAllChoose = ko.observable(false);//false表示全选，true表示取消全选
self.setBuyerUserId = function(buyerUserId){
self.buyerUserId(buyerUserId);
};
self.isCheckingOut = ko.observable(false);
self.carts = ko.observableArray();
self.showEmptyCart=ko.observable(false);
self.hasConfirm = ko.observable(false);
self.allChecked = ko.computed({
read: function () {
var allChecked = true;
$.each(self.carts(), function (idx, cart) {
if (!cart.allChecked()) {
allChecked = false;
}
});
return allChecked;
},
write:function(newValue){
self.batchChecking = true;
$.each(self.carts(), function (idx, cart) {
cart.allChecked(newValue);
});
self.batchChecking = false;
self.setCheckedItems();
}
});
self.allNotChecked = ko.computed(function(){
var allNotChecked = true;
$.each(self.carts(), function (idx, cart) {
if (!cart.allNotChecked()) {
allNotChecked = false;
}
});
return allNotChecked;
});
self.toggle = function(){
var allChecked = self.allChecked();
self.allChecked(!allChecked);
};
//全选事件
self.toggleAllChooseForApp = function(){
self.toggleAllChooseAction(true);
self.setCheckedItems();
}
self.batchChecking = false;
self.setCheckedItems = _.debounce(function(){
if(self.isLoadingData){
return;
}

if(!self.initialized){return;}
if(self.batchChecking){return;}
self.isLoadingData = true;
var postData = {};
if(self.toggleAllChooseAction()){
if(!self.toggleAllChoose()){
$.each(self.carts(),function(idx,cart){
var checkedItems = [];
$.each(cart.buyItems(),function(idx1,item){
checkedItems.push(item.itemId());
});
$.each(cart.orderRuleTargets,function(idx1,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx2,item){
checkedItems.push(item.itemId());
});
});
postData[cart.cartId()] = checkedItems.join(",");
});
}else{
$.each(self.carts(),function(idx,cart){
postData[cart.cartId()] = "";
});
}
}else{
$.each(self.carts(),function(idx,cart){
var checkedItems = [];
$.each(cart.buyItems(),function(idx1,item){
if(item.checked()){
checkedItems.push(item.itemId());
}
});
$.each(cart.orderRuleTargets,function(idx1,orderRuleTarget){
$.each(orderRuleTarget.items,function(idx2,item){
if(item.checked()){
checkedItems.push(item.itemId());
}
});
});
postData[cart.cartId()] = checkedItems.join(",");
});
}
//重置
self.toggleAllChooseAction(false);
$.post(AppConfig.url+AppConfig.setCheckedItemsUrl,{d:JSON.stringify(postData)},function(ret){
self.isLoadingData = false;
if(ret.state=='ok'){
self.loadCarts();
}
},"JSON");
},100);
self.checkedNumber = ko.computed(function(){
var number = 0;
$.each(self.carts(),function(idx,cart){
number += cart.checkedNumber();
});
return number;
});
self.checkedTotalWeight = ko.computed(function(){
var totalWeight = 0;
$.each(self.carts(),function(idx,cart){
totalWeight += Number(cart.checkedTotalWeight());
});
return totalWeight.toFixed(2);
});
self.loadCarts = _.debounce(function(){
var postData = {buyerUserId:self.buyerUserId(),m:AppConfig.merchantId,exm:AppConfig.exMerchantId,mergerCart:AppConfig.mergerCart,merchantType:AppConfig.merchantType};
if(AppConfig.spec){
postData.spec = AppConfig.spec; //图标大小 eg. 80X80
}
$.post(AppConfig.url+"/appMarket/appEditor/getCart.jsp",postData,function(data){
//判断是否登录状态
if(data&&data.userId){
self.isLogin(true);
self.buyerUserId(data.userId);
}else{
self.isLogin(false);
}
if(data.state=='emptyCar'){
self.showEmptyCart(true);
self.carts.removeAll();
$(document).trigger("cartsLoaded");
}
if(data.state=='ok'){
if(AppConfig.platform&&AppConfig.platform=="mobile"){
parent.App.getProductCountInCart();
}
self.batchChecking = true;
var i = 0;
var carts = $.map(data.oc,function(cart){
if(cart.crossBorder && i == 0){
cart.isFirstCrossBorder = true;
i++;
}
return new Cart(cart);
});
self.carts(carts);
if(data.oc.length>0){
self.showEmptyCart(false);
}else{
self.showEmptyCart(true);
}
self.batchChecking = false;
$(document).trigger("cartsLoaded");
self.initialized = true;
if(data.mids && data.mids.length>0){  // getCart.jsp 返回的商家列表
var str = "";
data.mids.forEach(function(value,index,array){
if(index != array.length-1){
str += value+",";
}else{
str += value;
}
});
}
self.mids(str);

if(AppConfig.platform&&AppConfig.platform=="mobile") {
parent.App.merchantIdEEE = str; // 这个是在orderFormJD.js里用到的，要传给orderForm.jsx
}
}
},"json");
self.hasConfirm(false);
},200);

self.changeNumber = function(buyItem,toNumber){
var invoker = this;
$.post(AppConfig.url+"/templates/public/shopping/handle/v3/changeAmount.jsp",{toNumber:toNumber,cartId:buyItem.cartId(),itemId:buyItem.itemId(),noOc:"y"},function(result){
if(result.state=='ok'){
self.loadCarts();
}
else{
// 商品库存不足时，会返回库存数量字段：sellCount，此时将购物车数量直接改为库存数量
if(result.sellCount){
//buyItem.number(result.sellCount);
//result.sellCount!=0&&invoker.changeNumber.call(invoker, buyItem, 0+result.sellCount); // 再次提交修改
}
if($.layer){
layer.alert(result.msg);
}
else{
confirmDialog.show(result.msg,function(){
result.sellCount==0?self.requireRemove(buyItem):self.loadCarts(); // 如果库存为0，将商品移除购物车
});
}
}
},"json");
};
self.checkOut = function(cart,isGift){
if(self.allNotChecked()){
confirmDialog.show("没有需要结算的商品",null);
return;
}
if(!self.allowCheckOut()){
confirmDialog.show("您的订单金额超过海关限制，请修改订单后再进行结算!",null);
return;
}
if(Number(self.totalTaxPrice()) > AppConfig.maxTaxPrice && !self.hasConfirm()){
self.hasConfirm(true);
confirmDialog.show("选中商品合计税费已超过海关规定的免税限额（￥"+AppConfig.maxTaxPrice+"），您需要缴税￥"+self.totalTaxPrice()+"元，确认要结算么?",self.checkOut,"土豪去结算","返回再看看","");
return;
}
$.post(AppConfig.url+AppConfig.getUserUrl,function(result){
if(result.state=="ok"){
if(isGift){
window.location.href = AppConfig.orderFormPageUrl + "?isGift=T";
}
else {
window.location.href = AppConfig.orderFormPageUrl
}
}else{
window.location.href=AppConfig.loginUrl;
}
},"json")
};

self.checkOutGift = function(cart){
//送礼专用
var isOk = true;
$.each(self.carts(),function(idx,cart){
if(cart.checkedNumber()>0 && cart.merchantId()!='m_90000'){
isOk = false;
}
});
if(!isOk){
confirmDialog.show("目前送礼功能只支持enjoy深圳的商品！",null);
}
else{

self.checkOut(null,true);
}

}

self.requireRemove = function(buyItem){
$.post(AppConfig.url+"/templates/public/shopping/handle/v3/deleteCartItem.jsp",{cartId:buyItem.cartId(),itemId:buyItem.itemId()},function(result){
if(result.state=='ok'){
//indexPage.getProductCountInCart();
self.loadCarts();
}
else{
layer.alert(result.msg);
}
},"json");
};
self.remove = function(buyItem){

confirmDialog.show("确定要从购物车中移除吗？",function(){
self.requireRemove(buyItem);
});
// layer.confirm("确定要从购物车中移除吗？",function(){
//     self.requireRemove(buyItem);
//     layer.closeAll();
// });
};

self.add = function(buyItem){
var toNumber = buyItem.number()+1;
self.changeNumber(buyItem,toNumber);
};
self.minus = function(buyItem){
var toNumber = buyItem.number()-1;
if(toNumber<=0){
return;
}
self.changeNumber(buyItem,toNumber);
};

self.toDetail=function(item){
if(item.isCombiProduct){
window.open("/packageProduct.jsp?id="+item.productId());
}else {

if ($.isFunction(item.productId)) {
window.open("/product.jsp?id=" + item.productId());
}
else {
window.open("/product.jsp?id=" + item.productId);
}

}
};

self.changeSku = function(item){
BuyFlowUtils.selectSkuEx(item.productId(),item.productName(),function(skuId){
if(!skuId){
return;
}
$.post(AppConfig.url + AppConfig.setCartSkuUrl,{cartId:item.cartId(),itemId:item.itemId(),skuId:skuId},function(ret){
if(ret.state=='ok'){
self.loadCarts();
}
},"JSON");
});
};
self.totalOrderProductPrice = ko.computed(function(){
var sum = 0;
$.each(self.carts(),function(idx,cart){
sum += Number(cart.totalOrderProductPrice());
});
return sum.toFixed(2);
});
self.totalPayPrice = ko.computed(function(){
var sum = 0;
$.each(self.carts(),function(idx,cart){
sum += Number(cart.totalPayPrice());
});
return sum.toFixed(2);
});

self.totalDiscount = ko.computed(function(){
var sum = 0;
$.each(self.carts(),function(idx,cart){
sum += Number(cart.totalDiscount());
});
return sum.toFixed(2);
});

self.totalIntegralPrice = ko.computed(function(){
var sum = 0;
$.each(self.carts(),function(idx,cart){
sum += Number(cart.totalIntegralPrice());
});
return sum.toFixed(2);
});
/*购物车总税金*/
self.totalTaxPrice = ko.computed(function(){
var sum = 0;
$.each(self.carts(),function(idx,cart){
if(cart.isCollectTax && cart.needPayTax()){
sum += Number(cart.totalTaxPrice());
}
});
return sum.toFixed(2);
});
/*购物车总税金,没有判断是否小于50,只用于显示*/
self.totalTaxPrice2 = ko.computed(function(){
var sum = 0;
$.each(self.carts(),function(idx,cart){
if(cart.isCollectTax){
sum += Number(cart.totalTaxPrice());
}
});
return sum.toFixed(2);
});

/*整个订单是否需要支付税金*/
self.needPayTax = ko.computed(function(){
return Number(self.totalTaxPrice()) > Number(AppConfig.maxTaxPrice);
});
/*含税购物车总金额*/
self.totalIncludeTaxPrice = ko.computed(function(){
var totalTaxPrice = Number(self.totalTaxPrice());
var totalPayPrice = Number(self.totalPayPrice());
/*如果税金大于50才需要一起结算*/
if(self.needPayTax()){
totalPayPrice += totalTaxPrice;
}
return totalPayPrice.toFixed(2);
});
//添加到收藏夹
self.favoriteProduct = function(item){
var params = {};
params["objId"] = item.productId();
params["type"] = "product";
$.post(AppConfig.url+"/ajax/favor_add_handler.jsp", params, function(msg) {
var data = $.trim(msg);
if (data == "none") {
window.location.href = AppConfig.loginUrl;
} else if (data == "ok") {
alert("收藏成功!");
self.requireRemove(item);
} else if (data == "existed") {
alert("此商品已收藏过!");
self.requireRemove(item);
} else {
alert("系统繁忙请稍后再试！");
}

});
};
//删除选中商品
self.removeSelected = function(){};
/*购物是否有跨境购物车*/
self.hasCrossBorderOrder = ko.computed(function(){
var hasCrossBorderOrder = false;
$.each(self.carts(), function (idx, cart) {
if (cart.isCrossBorder && cart.checkedNumber() > 0) {
hasCrossBorderOrder = true;
}
});
return hasCrossBorderOrder;
});
/*是否允许结算*/
self.allowCheckOut = ko.computed(function(){
var canCheckOut = true;
$.each(self.carts(), function (idx, cart) {
if (cart.isCrossBorder && cart.checkedNumber() > 0) {
var totalPayPrice = cart.totalPayPrice();
if(Number(totalPayPrice) > Number(AppConfig.maxAllowCrossOrderPrice) && Number(cart.checkedNumber()) > 1){
canCheckOut = false;
}
}
});
return canCheckOut;
});
self.toFix = function(value){
if(isNaN(value)){
return value;
}
//return Number(value).toFixed(2);//这个方法有个时候不会四舍五入，如0.015不会四舍五入到0.02
return Math.round(Number(value)*Math.pow(10,2))/Math.pow(10,2);
};
/*整个购物车是否需要交税*/
self.isCollectTax = ko.computed(function(){
$.each(self.carts(),function(idx,cart){
/*如果该购物车没有选中，那就不用管*/
if(cart.isCollectTax && cart.checkedNumber() > 0){
return true;
}
});
return false;
});
}



/**
* @return {boolean}
*/
function IdentityCodeValid(code) {
var pass= true;

if(code.length != 18){
return false;
}

//18位身份证需要验证最后一位校验位
if(code.length == 18){
code = code.split('');
//∑(ai×Wi)(mod 11)
//加权因子
var factor = [ 7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2 ];
//校验位
var parity = [ 1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2 ];
var sum = 0;
var ai = 0;
var wi = 0;
for (var i = 0; i < 17; i++) {
ai = code[i];
wi = factor[i];
sum += ai * wi;
}
if(parity[sum % 11] != code[17]){
pass =false;
}
}
return pass;
}
function ReadCertificate(oc) {
var self = this;
var cardReader;
self.oc = oc;
self.cardNo = ko.observable();
self.sexL = ko.observable();
self.nameL = ko.observable();
self.police = ko.observable();
self.nationL = ko.observable();
self.bornL = ko.observable();
self.activityL = ko.observable();
self.address = ko.observable();
self.isInit = false;

self.readCard = function () {
cardReader = document.getElementById("CardReader1");
if(!cardReader){
if ($.layer) {
layer.alert("身份证读取控件加载失败，请联系管理员!");
} else {
confirmDialog.show("身份证读取控件加载失败，请联系管理员!", function () {});
}
}
if (false == self.isInit) {
//设置端口号，1表示串口1，2表示串口2，依此类推；1001表示USB。0表示自动选择
cardReader.setPortNum(0);
self.isInit = true;
}
//使用重复读卡功能
cardReader.Flag = 0;

//读卡
var rst = cardReader.ReadCard();
//获取各项信息
if (0x90 == rst) {
self.sexL(cardReader.SexL());
self.cardNo(cardReader.CardNo());
self.nameL(cardReader.NameL());
self.police(cardReader.Police());
self.nationL(cardReader.NationL());
self.address(cardReader.Address());
self.activityL(cardReader.ActivityL());
self.bornL(cardReader.BornL());
if(self.oc){
self.oc.receiveUserName(self.nameL());
self.oc.certificate(self.cardNo());
self.oc.saveUserName();
}
}else{
self.sexL("");
self.cardNo("");
self.nameL("");
self.police("");
self.nationL("");
self.address("");
self.activityL("");
self.bornL("");
self.getState();
}
};
self.getState = function(){
if(!cardReader){
cardReader = document.getElementById("CardReader1");
}
cardReader.GetState()
}
}
var uploadingIdCardPic;
function idCardPicOnChane(flag) {
if (flag == "front") {
uploadingIdCardPic = layer.load('图片上传中...');
$("#idCardFrontPic_form").submit();
} else {
uploadingIdCardPic = layer.load('图片上传中...');
$("#idCardBackPic_form").submit();
}
}

function uploadIdCardPicCallback(data) {
layer.close(uploadingIdCardPic);
var jResult = JSON.parse(data);
var code = jResult.code;
var msg = jResult.msg;
var showMsg = "";
if (code == "0") {
if (jResult.picType == "front") {
orderFormPage.idCardFrontPicPreviewPath(jResult.relPtah);
orderFormPage.idCardFrontPicPreviewFullPath(jResult.fullPath);
orderFormPage.idCardFrontPic(jResult.fileId);
} else {
orderFormPage.idCardBackPicPreviewPath(jResult.relPtah);
orderFormPage.idCardBackPicPreviewFullPath(jResult.fullPath);
orderFormPage.idCardBackPic(jResult.fileId);
}
} else if (msg.indexOf("File is too large") > -1) {
showMsg = "文件上传失败，原因是文件超过了50K的限制";
} else if (msg.indexOf("fileType is not allowed") > -1) {
showMsg = "文件上传失败，原因是文件格式不正确，文件格式只支持jpg和gif";
} else {
showMsg = msg;
}

if(showMsg != ""){
confirmDialog.show(showMsg, function () {
});
}
}
function Consignee() {
var self = this;
self.consigneeList = ko.observableArray();
self.currConsignee = ko.observable();
self.selectedAddressId = ko.observable();
self.editFormVisible = ko.observable(false);
//    self.showMore = ko.observable(false);
//    self.showCount = ko.observable(2);
self.buyerId = null;
self.callback = null;
self.regionSelector = new OptionSelector();
self.regionSelector.registerChangeHandler(function(optionSelector,optionLevel){
if(optionLevel.currentOptionId()){
self.loadRegionChildren(optionLevel.currentOptionId());
}
});

self.selectedAddressId.subscribe(function(newValue){
if(newValue=='none'){
self.newConsignee();
}
else {
if(self.editFormVisible()){
$.each(self.consigneeList(), function (index, elem) {
if (elem.id() == newValue) {
self.edit(elem);
}
});
}
else{
$.each(self.consigneeList(), function (index, elem) {
if (elem.id() == newValue) {
self.selectConsignee(elem);
}
});
}
}
});


self.selectConsignee = function(consignee,callback){
self.selectedAddressId(consignee.id());
self.setCurrentConsignee(consignee,callback);

/*if(self.editFormVisible()){
self.setCurrentConsignee(consignee);
}*/
};


self.getCurrentConsignee = function(){
var consignee = null;
$.each(self.consigneeList(),function(index,elem){
if(elem.id()==self.selectedAddressId()){
consignee = elem;
}
});
return consignee;
};
self.confirmSelection = function(){
var consignee = self.getCurrentConsignee();
if(!consignee){
confirmDialog.show("请选择一个地址。",null);
}
$.post(AppConfig.url+AppConfig.setDefaultAddressUrl,{buyerId:self.buyerId,addressId:consignee.id()},function(ret){
if(ret.state=='ok'){
if(self.callback){
self.callback(consignee);
}
}
else{
confirmDialog.show(ret.msg,null);
}
},"json");

};
self.loadRegionChildren = function(regionId){
$.post(AppConfig.url+AppConfig.getRegionChildrenUrl,{regionId:regionId},function(ret){
if(ret.state=='ok'){
self.regionSelector.addOptionLevel(ret.regionLevel);
}
},"JSON");
};

self.loadRegion = function(regionId,callback){
$.post(AppConfig.url+AppConfig.getRegionLevelsUrl,{regionId:regionId||"c_region_1602"},function(ret){
if(ret.state=='ok'){
self.regionSelector.setOptionLevels(ret.regionLevels);
typeof(callback) == "function"?callback():null;
}
},"JSON");
};

self.setCurrentConsignee = function(consignee, callback){
self.currConsignee(consignee);
self.loadRegion(consignee.regionId(),callback) /*  bug  */
};


self.back = function () {
history.go(-1);
};
self.getConsigneeList = function () {
var postData = {
buyerId:self.buyerId
};
$.post(AppConfig.url+AppConfig.addressListUrl, postData,function (result) {
self.consigneeList.removeAll();
if (result.status == 'err') {
bootbox.alert(result.msg);
} else {
var addressList = result.addressList;
if(!addressList || addressList.length==0&&(!AppConfig.platform||AppConfig.platform!="mobile")){
self.newConsignee();
return;
}
for (var i = 0; i < addressList.length; i++) {
var param = {};
param.id = addressList[i].id;
param.region = addressList[i].region;
param.regionId = addressList[i].regionId;
param.regionIds = addressList[i].regionIds;
param.mobile = addressList[i].mobile;
param.userName = addressList[i].userName;
param.address = addressList[i].address;
param.postalCode = addressList[i].postalCode;
param.isDefault = addressList[i].isDefault;
param.regionName = addressList[i].regionName;
param.certificate = addressList[i].certificate;
var consignee = new ConsigneeAddress(param);
self.consigneeList.push(consignee);
//设置默认配送防谁
if(self.selectedAddressId()==addressList[i].id){
self.currConsignee(consignee);
}
}
}

}, "json")
};

self.show = function () {
if (self.showMore()) {
self.showMore(false);
self.showCount(2);
} else {
self.showMore(true);
self.showCount(5);
}
};

self.newConsignee = function(){
//新增加地址

self.editFormVisible(true);
self.selectedAddressId('none');
//self.loadRegion(); /*  debugger   */
//        if(self.currConsignee()){
//            var data = ko.mapping.toJS(self.currConsignee());
//            data.id = "none";
//            self.setCurrentConsignee(new ConsigneeAddress(data));
//        }
//        else{
self.setCurrentConsignee(new ConsigneeAddress({id:'none',mobile:AppConfig.mobile}));

//        }

};

self.edit = function(consignee){
self.editFormVisible(true);
//self.setCurrentConsignee(consignee);
self.selectConsignee(consignee);
};
self.deleteAddress = function(consignee){

$.post(AppConfig.url+AppConfig.deleteAddressUrl,{buyerId:self.buyerId,addressId:consignee.id()},function(ret){
if(ret.state=='ok'){
self.consigneeList.remove(consignee);
}
},"json");

};

self.hideEditForm = function(){
self.editFormVisible(false);
};
self.cancelEdit = function(){
self.hideEditForm();
};

self.saveData = function () {
var reqParam = {buyerId:self.buyerId};
reqParam.userName = self.currConsignee().userName();
reqParam.mobile = self.currConsignee().mobile();
reqParam.address = self.currConsignee().address();
reqParam.isDefault = self.currConsignee().isDefault();
reqParam.postalCode = self.currConsignee().postalCode();
reqParam.regionId = self.regionSelector.getCurrentOptionId() || self.currConsignee().regionId();
reqParam.addressId = self.currConsignee().id();
if(!reqParam.userName){
confirmDialog.show("收货人是必填的。");
return;
}
if(!reqParam.address){
confirmDialog.show("地址是必填的。");
return;
}
if(!reqParam.mobile){
confirmDialog.show("电话号码是必填的。");
}else{

//定义手机验证正则 不在这里做验证,在服务端做验证
/* var isMobile=/^1[3|4|5|8][0-9]\d{4,8}$/;
if(!isMobile.test(reqParam.mobile)){
confirmDialog.show("电话号码格式错误");
return;
}*/
}
if(!reqParam.regionId){
confirmDialog.show("请选择地区到最后一级。");
return;
}

$.post(AppConfig.url+AppConfig.saveAddressUrl, reqParam, function (result) {
if(result.state=='ok'){
if(self.callback){
self.editFormVisible(false);
self.callback();
}
else{
self.getConsigneeList();
self.hideEditForm();
}
}else {
confirmDialog.show(result.msg,null);
}
}, "JSON")
}
self.setCallback = function (callback) {
self.callback = callback;
}
};

/*
var consignee = null;
$(document).ready(function () {
consignee = new Consignee();
ko.applyBindings(consignee, document.getElementById("consigneePage"));
});
*/
function InvoiceChooser(){
var self = this;
self.invoiceList = ko.observableArray();
self.selectedInvoiceId =ko.observable();
self.currentInvoice = ko.observable();
self.editFormVisible = ko.observable(false);
self.invoiceType = ko.observable();
self.buyerId = null;
self.callback = null;

self.selectedInvoiceId.subscribe(function(newValue){
if(newValue=='newInvoice'){
self.newInvoice();
}
else if(newValue=='none'){
self.setCurrentInvoice(new Invoice({id:'none',title:'无需发票'}));
}
else {
$.each(self.invoiceList(), function (index, elem) {
if (elem.id() == newValue) {
self.setCurrentInvoice(elem);
}
});
}
});


self.getInvoiceList = function (){
var postData = {buyerId:self.buyerId};
$.post(AppConfig.url+AppConfig.getInvoiceListUrl,postData,function(ret){
if(ret.state!='ok'){
layer.alert("出错了:" + ret.msg);
return;
}
self.invoiceList($.map(ret.list,function(invoice){
return new Invoice(invoice);
}));
},"json");
};

self.getSelectedInvoice = function(){
var result = null;
$.each(self.invoiceList(),function(idx,invoice){
if(invoice.id()==self.selectedInvoiceId()){
result = invoice;
}
});
return result;
};

self.select = function(invoice){
self.selectedInvoiceId(invoice.id());
};

self.newInvoice = function(){
_.delay(function(){
var newInvoice = new Invoice({invoiceTitle:" "});
self.setCurrentInvoice(newInvoice);
self.editFormVisible(true);
});

};


self.editInvoice = function(invoice){
if(!self.editFormVisible()){
self.editFormVisible(true);
}
self.select(invoice);
self.setCurrentInvoice(invoice);
};
self.setCurrentInvoice = function(invoice){
self.currentInvoice(invoice);
};
self.deleteInvoice = function(invoice){
self.invoiceList.remove(invoice);
$.post(AppConfig.url+AppConfig.deleteInvoiceUrl,{buyerId:self.buyerId,id:invoice.id()},function(ret){
if(ret.state!='ok'){
layer.alert("出错了。");
}

},"JSON")
};
self.deleteSelected = function(){
self.invoiceList.remove(function(invoice) {
return invoice.id() == self.selectedInvoiceId();
});
$.post(AppConfig.url+AppConfig.deleteInvoiceUrl,{buyerId:self.buyerId,id:self.selectedInvoiceId()},function(ret){
if(ret.state!='ok'){
confirmDialog.show("出错了！");
}
self.selectedInvoiceId("none")
},"JSON")
};

self.confirmSelection = function(){
var invoice = self.getSelectedInvoice();
if(!invoice){
layer.alert("请先选择一个发票选项。");
return;
}
var postData = {
buyerId:self.buyerId,
invoiceId:invoice.id()
};

$.post(AppConfig.url+AppConfig.setDefaultInvoiceUrl,postData,function(ret){
if(ret.state=='ok'){
if(self.callback){
self.callback(invoice);
}
}
},"json");
};

self.saveData = function(){
var invoice = self.currentInvoice();
if(!invoice.invoiceTitle() || invoice.invoiceTitle().length==0){
confirmDialog.show("请输入发票抬头。");
return;
}

if(invoice.invoiceTitle().length > 50){
confirmDialog.show("发票抬头不能超过50个字。");
return;
}

var postData = {
buyerId:self.buyerId,
id:invoice.id(),
invoiceTitle:invoice.invoiceTitle(),
invoiceContent:invoice.invoiceContent(),
invoiceTypeKey:invoice.invoiceTypeKey(),
invoicePostAddress:invoice.invoicePostAddress()
};

$.post(AppConfig.url+AppConfig.saveInvoiceUrl,postData,function(ret){
if(ret.state=='ok'){
if(self.callback){
self.editFormVisible(false);
self.callback();
}
else{
self.getInvoiceList();
self.hideEditForm();
}
}
else{
layer.alert("保存错误："+ret.msg);
}
},"json");
};
self.cancelEdit = function(){
self.editFormVisible(false);
self.getInvoiceList();
}
}
function OrderFormPayment(){
var self = this;
self.paymentList = ko.observableArray();
self.selectedId = ko.observable();
self.merchantId = null;
self.callback = null;
self.buyerId = null;
self.getSelectedPayment = function(){
if(!self.selectedId()){
return null;
}
var result = null;
$.each(self.paymentList(),function(idx,elem){
if(elem.id()==self.selectedId()){
result = elem;
}
});
return result;
}

self.saveSelectedPayment = function(){
var postData = {
buyerId:self.buyerId,
merchantId:self.merchantId,
selectedPayInterfaceId:self.getSelectedPayment().payInterfaceId()
}

$.post(AppConfig.url+AppConfig.saveSelectedPaymentUrl,postData,function(ret){
if(ret.state=='ok'){
if(self.callback){
self.callback();
}
}
},"json");
}

self.init = function(paymentList,selectedId){
self.paymentList($.map(paymentList,function(payment){
return new Payment(payment);
}));
self.selectedId(selectedId);
}

self.select = function(payment){
self.selectedId(payment.id());
}
self.back = function(){
history.back();
}
}
var orderFormPayment =  null;
$(document).on("koInit",function(){
orderFormPayment = new OrderFormPayment();
var elem = document.getElementById("orderFormPaymentChooser");
if(elem){
ko.applyBindings(orderFormPayment, elem);
}
});
/*
$(document).ready(function () {
orderFormPayment = new OrderFormPayment();
ko.applyBindings(orderFormPayment, document.getElementById("orderFormPaymentChooser"));
});*/
function PluginItem(){
var self = this;
self.detailVisible = ko.observable(false);
self.orderForm = null;
self.toggle = function(){
self.detailVisible(!self.detailVisible());
}

self.onInit = function(orderForm){
self.orderForm = orderForm;
}


self.onUpdate = function(orderForm){
//should be override
}

self.onOrderFormChanged = function(orderForm){

}
}
function PluginItemIntegralPay (){
var self = this;
$.extend(self,new PluginItem());
//self.prototype = new PluginItem();
//积分与钱的会算比例
self.integralMoneyRatio = ko.observable(1);
//当前拥有的积分
self.integralBalance = ko.observable(0);
//用户输入，使用多少积分
self.useMoney = ko.observable();
self.confirmed = ko.observable(false);

self.integralMoneyBalance = ko.computed(function(){
return (Math.floor(self.integralBalance() * self.integralMoneyRatio() * 100)/100).toFixed(2);
});
self.orderForm = ko.observable(null);

//计算所有允许用积分的oc,剩下多少钱还没有支付，其中能用积分支付的钱还剩下多少没有支付
self.leftIntegralPayMoney = ko.computed(function(){
var sum = 0;
if(!self.orderForm()){
return 0;
}
for(var i=0; i<self.orderForm().ocs().length; i++){
var oc = self.orderForm().ocs()[i];
if(oc.supportIntegral){
//如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
var curAmount = 0;
curAmount = oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
//需要减去用券支付的部分
if(oc.usedTicketAmount){
curAmount -= oc.usedTicketAmount;
}
if(oc.usedPrepayCardAmount){
curAmount -= oc.usedPrepayCardAmount;
}
if (oc.usedDepositAmount) {
curAmount -= oc.usedDepositAmount;
}
if (oc.usedJiaJuQuanAmount) {
curAmount -= oc.usedJiaJuQuanAmount;
}
//由于积分和购物券不能用于支付运费，所以这里要判断能用积分支付的金额不能大于 商品金额 - 用券金额
var productPrice = oc.totalOrderProductPrice() - (oc.usedTicketAmount || 0);
if(productPrice < curAmount){
curAmount = productPrice;
}
sum += curAmount;
}
}
return sum>0?sum:0;
});

self.calcCanUseMoney = ko.computed(function(){
if(!self.orderForm()){
return 0;
}
var balance = self.integralMoneyBalance();//积分兑换成人民币的金额
var needPaid = self.leftIntegralPayMoney();//还剩能使用积分支付的金额
return Number(balance>needPaid ? needPaid : balance).toFixed(2);
});

//现有的积分等于多少钱
self.canUseMoney = ko.computed(function(){
return self.calcCanUseMoney();
});

self.getPaidMoneyByThisPlugin = function(oc){
return oc.usedIntegralAmount || 0;
};


self.useIntegral = ko.computed(function(useIntegral){
//使用多少积分
return Math.floor( self.useMoney()/self.integralMoneyRatio());
});

self.onInit = function(orderForm){
self.orderForm(orderForm);
};

self.onUpdate = function(data){
self.integralMoneyRatio(data.integralMoneyRatio);
self.integralBalance(data.integralBalance);
};

self.onOrderFormChanged = function(orderForm){
self.orderForm(orderForm);
};

self.setUseMoney = function(){
var canUseMoney = self.calcCanUseMoney();
if(Number(self.useMoney()) <= Number(canUseMoney)){
var useMoney = Number(self.useMoney()).toFixed(2);
self.useMoney(useMoney);
self.confirmed(true);
}
else{
self.useMoney(self.canUseMoney());
self.confirmed(true);
}

var sum = 0;
var left = self.useMoney();
var maxNeedPay = 0;
var maxNeedPayOc = null;
//分摊
$.each(self.orderForm().ocs(),function(idx,oc){
//先将sum计算出来
var needPay = oc.totalOrderProductPrice();
if(oc.usedTicketAmount){
needPay -= oc.usedTicketAmount;
}
if(oc.usedPrepayCardAmount){
needPay -= oc.usedPrepayCardAmount;
}
if (oc.usedDepositAmount) {
needPay -= oc.usedDepositAmount;
}
if (oc.usedJiaJuQuanAmount) {
needPay -= oc.usedJiaJuQuanAmount;
}
if(maxNeedPay < needPay){
maxNeedPay = needPay;
maxNeedPayOc = oc;
}
sum+=needPay;
});

$.each(self.orderForm().ocs(),function(idx,oc){
var needPay = oc.totalOrderProductPrice();
if(oc.usedTicketAmount){
needPay -= oc.usedTicketAmount;
}
if(oc.usedPrepayCardAmount){
needPay -= oc.usedPrepayCardAmount;
}
if (oc.usedDepositAmount) {
needPay -= oc.usedDepositAmount;
}
if (oc.usedJiaJuQuanAmount) {
needPay -= oc.usedJiaJuQuanAmount;
}
oc.usedIntegralAmount = Number(((needPay/sum) * self.useMoney()).toFixed(2));
left -= oc.usedIntegralAmount;
});
if(left != 0){
maxNeedPayOc.usedIntegralAmount = (maxNeedPayOc.usedIntegralAmount + left);
}
self.orderForm().updatePayRec({payInterfaceId:"payi_4",name:"积分支付",money:self.useMoney()});
};
self.edit = function(){
self.confirmed(false);
};

}
function PluginItemJiaJuQuanPay() {
var self = this;
$.extend(self, new PluginItem());

//家居券余额
self.mobile = ko.observable("");
self.jiaJuQuanNo = ko.observable("");
self.jiaJuQuanBalance = ko.observable(0);
//用户输入，使用多少家居券
self.useMoney = ko.observable();
self.confirmed = ko.observable(false);
self.useConfirmed = ko.observable(false);
self.checkingBalance = ko.observable(false);

self.orderForm = ko.observable(null);

//计算所有允许用积分的oc,剩下多少钱还没有支付，其中能用积分支付的钱还剩下多少没有支付
self.leftJiaJuQuanPayMoney = ko.computed(function () {
var sum = 0;
if (!self.orderForm()) {
return 0;
}
for (var i = 0; i < self.orderForm().ocs().length; i++) {
var oc = self.orderForm().ocs()[i];
if (oc.supportJiaJuQuan) {
//如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
var curAmount = 0;
curAmount = oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
//需要减去用券支付的部分
if (oc.usedTicketAmount) {
curAmount -= oc.usedTicketAmount;
}
if (oc.usedPrepayCardAmount) {
curAmount -= oc.usedPrepayCardAmount;
}
if (oc.usedDepositAmount) {
curAmount -= oc.usedDepositAmount;
}
if (oc.usedIntegralAmount) {
curAmount -= oc.usedIntegralAmount;
}
sum += curAmount;
}
}
return sum > 0 ? sum : 0;
});

self.calcCanUseMoney = ko.computed(function () {
if (!self.orderForm()) {
return 0;
}
var balance = Number(self.jiaJuQuanBalance());
var needPaid = self.leftJiaJuQuanPayMoney();
return Number(balance > needPaid ? needPaid : balance).toFixed(2);
});

self.canUseMoney = ko.computed(function () {
return self.calcCanUseMoney();
});

self.getPaidMoneyByThisPlugin = function (oc) {
return oc.usedIntegralAmount || 0;
};

self.onInit = function (orderForm) {
self.orderForm(orderForm);

};

self.onUpdate = function (data) {
self.mobile(data.buyerMobile);
};

self.onOrderFormChanged = function (orderForm) {
self.orderForm(orderForm);
};

self.setUseMoney = function () {
var canUseMoney = self.calcCanUseMoney();
if (Number(self.useMoney()) <= Number(canUseMoney)) {
var useMoney = Number(self.useMoney()).toFixed(2);
self.useMoney(useMoney);
self.confirmed(true);
self.useConfirmed(true);
}
else {
self.useMoney(self.canUseMoney());
self.confirmed(true);
self.useConfirmed(true);
}

var sum = 0;
var left = self.useMoney();
var maxNeedPay = 0;
var maxNeedPayOc = null;
//分摊
$.each(self.orderForm().ocs(), function (idx, oc) {
//先将sum计算出来
var needPay = oc.totalOrderProductPrice();
if (oc.usedTicketAmount) {
needPay -= oc.usedTicketAmount;
}
if (oc.usedPrepayCardAmount) {
needPay -= oc.usedPrepayCardAmount;
}
if (oc.usedDepositAmount) {
needPay -= oc.usedDepositAmount;
}
if (oc.usedIntegralAmount) {
needPay -= oc.usedIntegralAmount;
}
if (maxNeedPay < needPay) {
maxNeedPay = needPay;
maxNeedPayOc = oc;
}
sum += needPay;
});

$.each(self.orderForm().ocs(), function (idx, oc) {
var needPay = oc.totalOrderProductPrice();
if (oc.usedTicketAmount) {
needPay -= oc.usedTicketAmount;
}
if (oc.usedPrepayCardAmount) {
needPay -= oc.usedPrepayCardAmount;
}
if (oc.usedDepositAmount) {
needPay -= oc.usedDepositAmount;
}
if (oc.usedIntegralAmount) {
needPay -= oc.usedIntegralAmount;
}
oc.usedJiaJuQuanAmount = Number(((needPay / sum) * self.useMoney()).toFixed(2));
left -= oc.usedJiaJuQuanAmount;
});
if (left != 0) {
maxNeedPayOc.usedJiaJuQuanAmount = (maxNeedPayOc.usedIntegralAmount + left);
}
self.orderForm().updatePayRec({payInterfaceId: "payi_160", name: "品牌家居券支付", money: self.useMoney()});
};
self.edit = function () {
self.confirmed(false);
};
self.editUse = function () {
self.useConfirmed(false);
};

self.loadBalance = function () {
self.checkingBalance(true);

var codeMobile = escape(self.mobile);
var codeJiaJuQuanNo = escape(self.jiaJuQuanNo);
cons

var postData = {};
postData.mobile = codeMobile;
postData.jiaJuQuanNo = codeJiaJuQuanNo;
$.post(AppConfig.url + "/buyflowApp/server/order/getJiaJuQuanInfo.jsx", postData, function (ret) {
self.checkingBalance(false);
if (ret.state == 'err') {
confirmDialog.show(ret.msg);
return;
}
self.jiaJuQuanBalance(ret.remainAmount);
self.confirmed(true);
}, 'json');
};

}


function UseCardRule(data) {
var self = this;
self.type = data.type;//"item"; //item or order
self.ruleId = data.ruleId; //"";
self.availableBatches = data.availableBatches;
self.amount = data.amount;
self.oc = data.oc;
}
function PluginItemUseTicket() {
var self = this;
$.extend(self, new PluginItem());
self.orderForm = ko.observable();
self.availableRules = ko.observableArray([]);
self.maxAvailableCardBatches = ko.observableArray([]);


self.onInit = function (orderForm) {
self.orderForm(orderForm);
//self.availableRules(self.getAvailableCardRules());
//self.maxAvailableCardBatches(self.getMaxAvailableCardBatches());
//self.distributeCards();
//self.getSelectableNumbers();
};

self.onUpdate = function (rawData) {
self.availableRules(self.getAvailableCardRules());
self.maxAvailableCardBatches(self.getMaxAvailableCardBatches());
self.getSelectableNumbers();
};
self.onOrderFormChanged = function(orderForm){
self.orderForm(orderForm);
self.getSelectableNumbers();
}

self.selectedCardBatches = ko.observableArray();
self.hasAvailableCards = ko.computed(function () {
return self.maxAvailableCardBatches() && self.maxAvailableCardBatches().length > 0;
});

self.noAvailableCards = ko.computed(function () {
return !self.hasAvailableCards();
});

self.getAvailableCardRules = function () {
var allCardRules = [];
if (!self.orderForm()) {
return [];
}
var crossOrderRuleResults = self.orderForm().crossOrderRuleResults();
$.each(self.orderForm().ocs(), function (idx, oc) {
if (oc.availableRuleResults) {
$.each(oc.availableRuleResults, function (idx, ruleResult) {
if(ruleResult.type!="OUC"){
return;
}

_.each(ruleResult.availableCardRules,function(cardRule){
if(cardRule.recommend){
return;
}
var rule = new UseCardRule({
type: ruleResult.type,
ruleId: ruleResult.ruleId,
availableBatches: cardRule.availableBatches,
amount: cardRule.amount,
oc:oc
});
allCardRules.push(rule);
});

});
}
$.each(oc.buyItems(),function(idx1,item){
if(item.availableRuleResults){
$.each(item.availableRuleResults, function (idx2, ruleResult) {
if(ruleResult.type!="puc"){
return;
}
_.each(ruleResult.availableCardRules,function(cardRule){
if(cardRule.recommend){
return;
}
var rule = new UseCardRule({
type: ruleResult.type,
ruleId: ruleResult.ruleId,
availableBatches: cardRule.availableBatches,
amount: cardRule.amount,
oc:oc
});
allCardRules.push(rule);
});
});
}
});
});

if (crossOrderRuleResults) {
$.each(crossOrderRuleResults, function (idx, ruleResult) {
if(ruleResult.type!="OUC"){
return;
}
_.each(ruleResult.availableCardRules,function(cardRule){
if(cardRule.recommend){
return;
}
var rule = new UseCardRule({
type: ruleResult.type,
ruleId: ruleResult.ruleId,
availableBatches: cardRule.availableBatches,
amount: cardRule.amount
});
allCardRules.push(rule);
});

});
}


console.log("allCardRules", allCardRules);
return allCardRules;
};

self.getMaxAvailableCardBatches = function(){
//1.获得所有的cardBatches
var allCardBatches = self.orderForm().ocs()[0].allCardBatches;
var crossOrderRuleResults = self.orderForm().crossOrderRuleResults();
console.log("allCardBatches1", allCardBatches);
$.each(self.orderForm().ocs(),function(idx,oc){
var batches = oc.allCardBatches;
if(batches && batches.length>0){
allCardBatches = batches;
}
});
$.each(crossOrderRuleResults, function (idx, ruleResult) {
if(ruleResult.type!="OUC"){
return;
}

_.each(ruleResult.availableCardRules,function(cardRule){
if(cardRule.recommend){
return;
}
var availableBatches = cardRule.availableBatches;
if(availableBatches){
for(var i =0;i<availableBatches.length;i++){

allCardBatches.push(availableBatches[i]);
}
}

});

});
console.log("allCardBatches2", allCardBatches);
var effectiveBatches = [];
//2.计算每个cardBatch如果其他卡都不选，只选本cardBatches的时候能有多少张卡可以使用
$.each(allCardBatches,function(idx,batch){
var effectiveBatch = {
id:batch.id,
name:batch.name,
faceValue:batch.faceValue,
maxAmount : 0,
checked : ko.observable(false),
selectedNumber : ko.observable(0),
selectableNumber : ko.observable(0),
disabled:ko.observable(false),
begin:batch.effectedBeginString,
end:batch.effectedEndString,
options : ko.observableArray(),
allCardsNumber:batch.allCards.length
};
$.each(self.availableRules(),function(idx1,rule){
//看看这个batch能满足多少amount
var found = false;
$.each(rule.availableBatches,function(idx2,availableBatch){
if(batch.id == availableBatch.id){
found = true;
}
});
if(found){
effectiveBatch.maxAmount+=rule.amount;
}
});
if(effectiveBatch.maxAmount > effectiveBatch.faceValue * effectiveBatch.allCardsNumber){
effectiveBatch.maxAmount = effectiveBatch.faceValue * effectiveBatch.allCardsNumber;
}
self.selectingNumbers = true; //为了防止在getSelectableNumbers中修改selectedNumber引起死循环


effectiveBatch.checked.subscribe(function(newValue){
if(!self.selectingNumbers) {
self.getSelectableNumbers();
self.confirm();
}
});
effectiveBatch.selectedNumber.subscribe(function(newValue){
if(!self.selectingNumbers){
_.defer(function(){
self.getSelectableNumbers();
self.confirm();
});
}
});
self.selectingNumbers = false;
effectiveBatches.push(effectiveBatch);
});
console.log("effectiveBatches", effectiveBatches);
return effectiveBatches;
};

self.getPaidMoneyByThisPlugin = function(oc){
return oc.usedTicketAmount;
};

self.distributeCards = function(excludeBatchId){
$.each(self.availableRules(),function(i,rule){
rule.usedAmount = 0;
});
//首先计算每个Oc除了用券支付以外的剩下的需要支付的金额
$.each(self.orderForm().ocs(),function(i,oc){
if(!oc){
return;
}
oc.tempNeedPaid = oc.finalPayAmount()-AppConfig.leftCashPayAmount; //保留一块钱，每次支付最少用1块钱。这样可以打出发票
for (var k in self.orderForm().pluginItems) {
var plugin = self.orderForm().pluginItems[k];
if(plugin instanceof PluginItemUseTicket){
continue;
}
oc.tempNeedPaid -= plugin.getPaidMoneyByThisPlugin(oc);
}
//由于积分和购物券不能用于支付运费，所以这里要判断能用积分支付的金额不能大于 商品金额 - 用券金额
var productPrice = oc.totalOrderProductPrice() - (oc.usedIntegralAmount || 0);
if(productPrice < oc.tempNeedPaid){
oc.tempNeedPaid = productPrice;
}
});
//计算当排除了excludeBatchId后，的一种分法
//是将卡分摊到卡规则，而不是将卡分摊到oc，不过由于卡规则是属于某各oc的，所以我们将卡规则累加就可以了。
$.each(self.maxAvailableCardBatches(),function(idx,batch){
if(batch.id==excludeBatchId){
return;
}
if(!batch.checked()){
return;
}
var secondRound = [];
var leftAmount = batch.selectedNumber() * batch.faceValue;//开始分摊某批次的卡，还剩下多少钱没有分摊
$.each(self.availableRules(),function(idx1,rule){
if(leftAmount==0 || !rule.oc){
return;
}
var found = _.findWhere(rule.availableBatches,{id:batch.id});
if(!found){
return;
}
found = _.findWhere(rule.availableBatches,{id:excludeBatchId});
if(found){
secondRound.push(rule);
return;
}
var useAmount = leftAmount;
if(rule.amount-rule.usedAmount<useAmount){
useAmount = rule.amount - rule.usedAmount;
}

//能用多少钱还要看这个oc还有多少钱需要支付
if(rule.oc.tempNeedPaid < useAmount){
useAmount = rule.oc.tempNeedPaid;
}


useAmount = Math.floor(useAmount/batch.faceValue+0.00001) * batch.faceValue;
rule.oc.tempNeedPaid-=useAmount;
rule.usedAmount += useAmount;
leftAmount -= useAmount;

});
if(leftAmount > 0){
secondRound = _.sortBy(secondRound,function(rule){return rule.availableBatches.length;});
$.each(secondRound,function(idx1,rule){
if(leftAmount==0 || !rule.oc){
return ;
}
var useAmount = leftAmount;
if(rule.amount-rule.usedAmount<useAmount){
useAmount = rule.amount - rule.usedAmount;
}
//能用多少钱还要看这个oc还有多少钱需要支付
if(rule.oc.tempNeedPaid < useAmount){
useAmount = rule.oc.tempNeedPaid;
}
useAmount = Math.floor(useAmount/batch.faceValue+0.0001) * batch.faceValue;
rule.usedAmount += useAmount;
rule.oc.tempNeedPaid-=useAmount;
leftAmount -= useAmount;
});
}

//跨商家用券计算....begin
if(leftAmount > 0){
var totalLeftCrossAmount = 0;
$.each(self.orderForm().ocs(),function(i,oc){
if(!oc){
return;
}
totalLeftCrossAmount += oc.tempNeedPaid;
});

if(totalLeftCrossAmount < leftAmount){
leftAmount = totalLeftCrossAmount;
}

var crossSecondRound = [];
$.each(self.availableRules(),function(idx1,rule){
if(rule.oc){
//有oc的就不是跨商家用券了
return;
}
var found = _.findWhere(rule.availableBatches,{id:batch.id});
if(!found){
return;
}
found = _.findWhere(rule.availableBatches,{id:excludeBatchId});
if(found){
crossSecondRound.push(rule);
return;
}
var useAmount = leftAmount;
if(rule.amount-rule.usedAmount<useAmount){
useAmount = rule.amount - rule.usedAmount;
}
//
////能用多少钱还要看这个oc还有多少钱需要支付
//if(rule.oc.tempNeedPaid < useAmount){
//    useAmount = rule.oc.tempNeedPaid;
//}
useAmount = Math.floor(useAmount/batch.faceValue+0.00001) * batch.faceValue;
//rule.oc.tempNeedPaid-=useAmount;
rule.usedAmount += useAmount;
leftAmount -= useAmount;

});
}
if(leftAmount > 0){
crossSecondRound = _.sortBy(crossSecondRound,function(rule){return rule.availableBatches.length;});
$.each(crossSecondRound,function(idx1,rule){
if(rule.oc) {
return ;
}
var useAmount = leftAmount;
if(rule.amount-rule.usedAmount<useAmount){
useAmount = rule.amount - rule.usedAmount;
}
////能用多少钱还要看这个oc还有多少钱需要支付
//if(rule.oc.tempNeedPaid < useAmount){
//    useAmount = rule.oc.tempNeedPaid;
//}
useAmount = Math.floor(useAmount/batch.faceValue+0.0001) * batch.faceValue;
rule.usedAmount += useAmount;
//rule.oc.tempNeedPaid-=useAmount;
leftAmount -= useAmount;
});
}
//跨商家用券计算....end


if(leftAmount - 0.0001 > 0){
batch.number = Math.ceil(leftAmount / batch.faceValue-0.0001);
}
});
}
self.getSelectableNumber = function(batchId,faceValue){
self.distributeCards(batchId);
var totalNumber = 0;
_.each(self.availableRules(),function(rule){
var found = _.findWhere(rule.availableBatches,{id:batchId});
if(found){
if(!rule.oc){
return ;
}
//这个rule对这个batch的贡献
var leftAmount = (rule.amount - rule.usedAmount);
if(rule.oc.tempNeedPaid < leftAmount){
leftAmount = rule.oc.tempNeedPaid;
}
var ruleNumber = Math.floor(leftAmount / faceValue+0.0001);
totalNumber += ruleNumber;
rule.oc.tempNeedPaid -= ruleNumber * faceValue;
}

});

//跨商家用券计算....begin
var totalLeftCrossAmount = 0;
$.each(self.orderForm().ocs(),function(i,oc){
if(!oc){
return;
}
totalLeftCrossAmount += oc.tempNeedPaid;
});
if(totalLeftCrossAmount < 0){
totalLeftCrossAmount = 0;
}
console.log("totalLeftCrossAmount=" + totalLeftCrossAmount);
_.each(self.availableRules(),function(rule){
var found = _.findWhere(rule.availableBatches,{id:batchId});
if(found){
if(rule.oc){
return ;
}
//这个rule对这个batch的贡献
var leftAmount = (rule.amount - rule.usedAmount);
if(totalLeftCrossAmount < leftAmount){
leftAmount = totalLeftCrossAmount;
}
var ruleNumber = Math.floor(leftAmount / faceValue+0.0001);
totalNumber += ruleNumber;
//rule.oc.tempNeedPaid -= ruleNumber * faceValue;
}
});
//跨商家用券计算....end
//totalNumber 不能大于用户拥有的卡数量
return totalNumber;
}
//考虑了用户已经选择的卡后，计算每各批次还能选择多少张卡
self.getSelectableNumbers= function(){
if(self.selectingNumbers){
return;
}
self.selectingNumbers = true;
var effectiveBatches = self.maxAvailableCardBatches();
$.each(effectiveBatches,function(dumy,batch){
batch.disabled(false);
var maxNumber = self.getSelectableNumber(batch.id,batch.faceValue);
if(maxNumber > 0){
if(maxNumber>batch.allCardsNumber){
maxNumber = batch.allCardsNumber;
}
batch.selectableNumber(maxNumber);
batch.options (_.range(1,maxNumber+1));
var checked = batch.checked();
if(!checked){
batch.selectedNumber(1);
}
}
else{
batch.selectedNumber(Math.floor(batch.maxAmount / batch.faceValue+0.001));
batch.checked(false);
batch.disabled(true);
}

});
self.selectingNumbers = false;
}

self.getTotalUsedMoney = function(){
var sum = 0;
_.each(self.maxAvailableCardBatches(),function(batch){
if(batch.checked()){
sum += batch.selectedNumber() * batch.faceValue;
}
});
return sum;
}

self.getTotalUsedNumber = function(){
var sum = 0;
_.each(self.maxAvailableCardBatches(),function(batch){
if(batch.checked()){
sum += batch.selectedNumber();
}
});
return sum;
}

self.onAddOrder = function () {
var selectedCardBatchAmount = [];
$.each(self.maxAvailableCardBatches(), function (idx, cardBatch) {
if(cardBatch.checked()){
selectedCardBatchAmount.push({
cardBatchId: cardBatch.id,
selectedNumber: cardBatch.selectedNumber()
});
}

});
console.log("selectedCardBatchAmount=",selectedCardBatchAmount);
return {
selectedCardBatchAmounts: JSON.stringify(selectedCardBatchAmount)
}
}


self.totalUsedMoney = ko.observable(0);
self.totalUsedNumber = ko.observable(0); //使用的券的张数

self.confirm = function () {
var sum = (self.getTotalUsedMoney()+0.0001).toFixed(2);
self.totalUsedMoney(sum);
self.totalUsedNumber((self.getTotalUsedNumber()+0.0001).toFixed(0));
//计算每个oc已经使用的券
$.each(self.orderForm().ocs(), function (idx, oc) {
oc.usedTicketAmount = 0;
});
self.distributeCards("excludeNone");//用一个肯定不会命中的cardId,保证不会被排除，实现所有卡批次都分配到rule
$.each(self.availableRules(),function(i,rule){
if(rule.oc){
rule.oc.usedTicketAmount+=Number(rule.usedAmount);
}
});


self.orderForm().updatePayRec({payInterfaceId: "payi_2", name: "用券支付", money: sum});
}

self.close = function(){
self.detailVisible(false);
}
}
function PrepayCard(data) {
var self = this;
self.cardNo = data.cardNo;
self.cardId = data.cardId;
self.cardAmount = data.cardAmount;
self.useAmount = ko.observable(data.useAmount || 0);
self.parent = null;
self.loading = ko.observable(false);
self.loadSuccess = ko.observable(true);
self.guardedUseAmount = ko.computed({
read: function () {
return self.useAmount().toFixed(2);
},
write: function (value) {

// Strip out unwanted characters, parse as float, then write the
// raw data back to the underlying "price" observable
value = parseFloat(value.replace(/[^\.\d]/g, ""));
if (isNaN(value)) {
confirmDialog.show("不正确的金额!");
return;
}
if (value > Number(self.cardAmount)) {
confirmDialog.show("不正确的金额,超出了卡余额!");
return;
}
var leftPayAmount = Number(self.parent.leftAmount());
if(leftPayAmount <= 0 && self.useAmount() == 0){
confirmDialog.show("订单已经全部支付，不需要再使用预付卡支付了哦!");
self.useAmount(value);
self.useAmount(0);
return;
}
leftPayAmount = leftPayAmount + self.useAmount();
if (Number(leftPayAmount) < Number(value)) {
value = leftPayAmount;
}
//不需设置一下,ko会认为数据没改变,不会修改页面的值
self.useAmount(0);
self.useAmount(isNaN(value) ? 0 : value); // Write to underlying storage
},
owner: this
});
}
function BindCard(data) {
var self = this;
self.cardNo = data.cardNo;
self.password = data.password;
}
function PluginItemPrepayCard() {
var self = this;
$.extend(self, new PluginItem());

self.loading = ko.observable(true);
self.cards = ko.observableArray();
self.checkingCard = ko.observable(false);
self.bindCards = ko.observableArray();

self.adding = ko.observable(false);
self.newCardNo = ko.observable();
self.newCardPassword = ko.observable();

self.removeCard = function (card) {
self.cards.remove(card);
};

self.beginAdd = function () {
self.adding(true);
self.newCardNo("");
self.newCardPassword("");
};

//剩下需要用预付卡支付的金额
self.leftAmount = function () {
var sum = 0;
if (!self.orderForm) {
return 0;
}
for (var i = 0; i < self.orderForm.ocs().length; i++) {
var oc = self.orderForm.ocs()[i];
if (oc.supportStoreCard) {
//如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
sum += oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
//需要减去用券支付的部分
if (oc.usedTicketAmount) {
sum -= oc.usedTicketAmount;
}
if (oc.usedIntegralAmount) {
sum -= oc.usedIntegralAmount;
}
if (oc.usedDepositAmount) {
sum -= oc.usedDepositAmount;
}
}
}
sum -= self.totalUseAmount();
return sum > 0 ? sum : 0;
};


self.doAdd = function (data) {
var cardNo = self.newCardNo();
var password = self.newCardPassword();
if (!cardNo) {
confirmDialog.show("您还没有输入卡号。");
return;
}
if (!password) {
confirmDialog.show("请输入网上支付密码。");
return;
}
var duplicated = false;
$.each(self.cards(), function (idx, card) {
if (card.cardNo == cardNo) {
duplicated = true;
}
});
/* self.cards().forEach(function(card){
if(card.cardNo == cardNo){
duplicated = true;
}
});*/
if (duplicated) {
confirmDialog.show("您输入了重复的卡号。");
return;
}
self.checkingCard(true);
$.post(AppConfig.url+"/buyflowApp/server/order/getPrepayCardInfo.jsx", {cardNo: self.base64Encrypt(cardNo), password: self.base64Encrypt(password)}, function (ret) {
self.adding(false);
self.checkingCard(false);
if (ret.state == 'err') {
confirmDialog.show(ret.msg);
return;
}
var card = new PrepayCard({
cardNo: cardNo,
cardId: cardNo,
cardAmount: Number(ret.remainAmount),
useAmount: Number(ret.remainAmount) > self.leftAmount() ? self.leftAmount() : Number(ret.remainAmount)
});
card.parent = self;
var leftPayAmount = Number(self.orderForm.leftPayAmount());
card.useAmount.subscribe(function () {
setTimeout(function () {
self.confirm()
}, 1)
});
if (leftPayAmount < card.useAmount()) {
card.useAmount(leftPayAmount)
}
self.cards.push(card);
if (data) {
self.bindCards.remove(data);
}
}, "json");
self.adding(false);
};
//原生使用预付卡回调方法
self.usePrepayCardForApp = function(data){
self.cards([]);
for(var i=0;i<data.length;i++){
var card = new PrepayCard({
cardNo: data[i].cardNo,
cardId: data[i].cardNo,
cardAmount: Number(data[i].remainAmount),
useAmount: Number(data[i].useAmount)
});
card.useAmount.subscribe(function () {
setTimeout(function () {
self.confirm()
}, 1)
});
card.useAmount(Number(data[i].useAmount));
self.cards.push(card);
}
};

self.onInit = function (orderForm) {
self.orderForm = orderForm;
self.loadBindCard();
};

self.onUpdate = function (data) {
};
self.totalUseAmount = ko.computed(function () {
var useAmount = 0;
$.each(self.cards(), function (idx, card) {
useAmount = useAmount + Number(card.useAmount());
});
/*self.cards().forEach(function(card){
useAmount = useAmount + Number(card.useAmount());
});*/
return useAmount.toFixed(2);
});

self.cards.subscribe(function () {
self.confirm();
});

self.onAddOrder = function () {
var cards = [];
$.each(self.cards(), function (idx, card) {
if (card.useAmount() > 0) {
cards.push({
cardNo: card.cardNo,
cardId: card.cardId,
useAmount: card.useAmount()
});
}
});
/*self.cards().forEach(function(card){
cards.push({
cardNo:card.cardNo,
cardId:card.cardId,
useAmount:card.useAmount()
});
});*/
return {
prepayCards: JSON.stringify(cards)
}
};

self.confirm = function () {
var sum = self.totalUseAmount();
var left = sum;
var maxNeedPay = 0;
var maxNeedPayOc = null;
$.each(self.orderForm.ocs(), function (i, oc) {
var needPay = oc.finalPayAmount();
if (oc.usedIntegralAmount) {
needPay -= oc.usedIntegralAmount;
}
if (oc.usedTicketAmount) {
needPay -= oc.usedTicketAmount;
}
if (oc.usedDepositAmount) {
needPay -= oc.usedDepositAmount;
}
if (maxNeedPay < needPay) {
maxNeedPay = needPay;
maxNeedPayOc = oc;
}
if(needPay > 0){
oc.usedPrepayCardAmount = Number(((needPay / sum) * self.totalUseAmount()).toFixed(2));
left -= oc.usedPrepayCardAmount;
}else{
oc.usedPrepayCardAmount = 0;
//console.log("needPay:"+needPay);
}
});
if (left != 0) {
maxNeedPayOc.usedPrepayCardAmount = maxNeedPayOc.usedPrepayCardAmount + left;
}
self.orderForm.updatePayRec({payInterfaceId: "payi_10", name: "预付卡/礼品卡支付", money: self.totalUseAmount()})
};

self.getPaidMoneyByThisPlugin = function (oc) {
return oc.usedPrepayCardAmount || 0;
};
self.doBindCardAdd = function (data) {
self.newCardNo(data.cardNo);
self.newCardPassword(data.password);
self.doAdd(data);
};
self.loadBindCard = function () {
//获取用户绑定的预付卡,并读取出余额
$.post(AppConfig.url+"/buyflowApp/server/order/getUserPrepayCardList.jsx", {}, function (ret) {
if (ret.total > 0) {
var cards = ret.cards;
for (var i = 0; i < cards.length; i++) {
var returnCard = cards[i];
var card = new BindCard({
cardNo: returnCard.cardNo,
password: ''
});
self.bindCards.push(card);
}
self.checkingCard(false);
self.adding(false);
}
}, "json");
};
//查询余额
self.loadBalance = function (card) {
card.loading(true);
$.post(AppConfig.url+"/buyflowApp/server/order/getPrepayCardInfo.jsx", {cardNo: card.cardNo, password: ''}, function (ret) {
if (ret.state == 'err') {
confirmDialog.show(ret.msg);
self.adding(false);
self.checkingCard(false);
return;
}
card.cardAmount = ret.remainAmount;
card.loadSuccess(true);
card.loading(false);
}, 'json');
};
self.base64Encrypt = function (data) {
if (typeof CryptoJS == "undefined") {
return data;
}
var str = CryptoJS.enc.Utf8.parse(data);
return CryptoJS.enc.Base64.stringify(str);
};
}
function PluginItemPreDepositPay() {
var self = this;
$.extend(self, new PluginItem());

self.depositBalance = ko.observable(0);
self.depositAppliedColumnIds = ko.observable(0);
//用户输入，使用多少钱
self.useMoney = ko.observable();
//可用的预存款金额
self.canUsePredeposit = ko.observable();
self.confirmed = ko.observable(false);
self.orderForm = ko.observable(null);

//计算所有允许用预存款的oc,剩下多少钱还没有支付，其中能用预存款支付的钱还剩下多少没有支付
self.leftDepositPayMoney = ko.computed(function () {
var sum = 0;
if (!self.orderForm()) {
return 0;
}

for (var i = 0; i < self.orderForm().ocs().length; i++) {
var oc = self.orderForm().ocs()[i];
if (oc.supportPreDeposit) {
//如果订单金额小于必须使用现金支付的金额,那就不限制使用现金支付
sum += oc.finalPayAmount() - AppConfig.leftCashPayAmount >= 0 ? oc.finalPayAmount() - AppConfig.leftCashPayAmount : oc.finalPayAmount();
//需要减去用券支付的部分
if (oc.usedTicketAmount) {
sum -= oc.usedTicketAmount;
}
//用储值卡的
if (oc.usedPrepayCardAmount) {
sum -= oc.usedPrepayCardAmount;
}
//用积分的
if (oc.usedIntegralAmount) {
sum -= oc.usedIntegralAmount;
}
//用家居券支付的
if (oc.usedJiaJuQuanAmount) {
sum -= oc.usedJiaJuQuanAmount;
}

if (self.depositAppliedColumnIds() && self.depositAppliedColumnIds().length > 0) {
//如果有设置预存款使用规则
var buyItems = oc.buyItems();

for (var k = 0; k < buyItems.length; k++) {
var jItem = buyItems[k];

if (!checkColumnId(jItem.columnIds())) {
//减去不满足使用预存款的的item金额
sum -= jItem.totalPayPrice();
}
}
}

}
}

function checkColumnId(ids) {
var columnIds = ids.split(",");
for (var n = 0; n < self.depositAppliedColumnIds().length; n++) {
var cid = self.depositAppliedColumnIds()[n];
for (var m = 0; m < columnIds.length; m++) {
if (columnIds[m] == cid) {
return true;
}

}

}


return false;
}

return sum > 0 ? sum : 0;
});

self.getCanUsePredeposit = ko.computed(function () {
if (!self.orderForm()) {
return 0;
}
var balance = self.depositBalance();
var needPaid = self.leftDepositPayMoney();
return Number(balance > needPaid ? needPaid : balance).toFixed(2);
});

self.calcCanUseMoney = ko.computed(function () {
if (!self.orderForm()) {
return 0;
}
var balance = self.depositBalance();
var needPaid = self.leftDepositPayMoney();
return Number(balance > needPaid ? needPaid : balance).toFixed(2);
});

//现有的积分等于多少钱
self.canUseMoney = ko.computed(function () {
return self.calcCanUseMoney();
});

self.getPaidMoneyByThisPlugin = function (oc) {
return oc.usedDepositAmount || 0;
};

self.onInit = function (orderForm) {
self.orderForm(orderForm);
};

self.onUpdate = function (data) {
self.depositBalance(data.depositBalance);
self.depositAppliedColumnIds(data.depositAppliedColumnIds);
};

self.onOrderFormChanged = function (orderForm) {
self.orderForm(orderForm);
};

self.setUseMoney = function () {
var canUseMoney = self.calcCanUseMoney();
if (Number(self.useMoney()) <= Number(canUseMoney)) {
var useMoney = Number(self.useMoney()).toFixed(2);
self.useMoney(useMoney);
self.confirmed(true);
}
else {
self.useMoney(self.canUseMoney());
self.confirmed(true);
}

var sum = 0;
var left = self.useMoney();
var maxNeedPay = 0;
var maxNeedPayOc = null;
//分摊
$.each(self.orderForm().ocs(), function (idx, oc) {
//先将sum计算出来
var needPay = oc.finalPayAmount();
if (oc.usedTicketAmount) {
needPay -= oc.usedTicketAmount;
}
if (oc.usedPrepayCardAmount) {
needPay -= oc.usedPrepayCardAmount;
}
if (oc.usedIntegralAmount) {
needPay -= oc.usedIntegralAmount;
}
if (oc.usedJiaJuQuanAmount) {
needPay -= oc.usedJiaJuQuanAmount;
}
if (maxNeedPay < needPay) {
maxNeedPay = needPay;
maxNeedPayOc = oc;
}
sum += needPay;
});

$.each(self.orderForm().ocs(), function (idx, oc) {
var needPay = oc.finalPayAmount();
if (oc.usedTicketAmount) {
needPay -= oc.usedTicketAmount;
}
if (oc.usedPrepayCardAmount) {
needPay -= oc.usedPrepayCardAmount;
}
if (oc.usedIntegralAmount) {
needPay -= oc.usedIntegralAmount;
}
if (oc.usedJiaJuQuanAmount) {
needPay -= oc.usedJiaJuQuanAmount;
}
oc.usedDepositAmount = Number(((needPay / sum) * self.useMoney()).toFixed(2));
left -= oc.usedDepositAmount;
});
if (left != 0) {
maxNeedPayOc.usedDepositAmount = (maxNeedPayOc.usedDepositAmount + left);
}
self.orderForm().updatePayRec({payInterfaceId: "payi_5", name: "预存款支付", money: self.useMoney()});
};
self.edit = function () {
self.confirmed(false);
}

}
function DeliveryPointSelector(data) {
var self = this;

self.currDeliveryPoint = ko.observable();
self.deliveryPointList = ko.observableArray([]);
self.regionSelector = new OptionSelector();
self.selectedDeliveryPointId = ko.observable();
self.merchantId = data.merchantId || "";
self.deliveryPointRegionId = ko.observable(data.deliveryPointRegionId || "");
self.noDeliveryPointDesc = ko.observable("该地区没有设置自提点，请选择其他区域！");
self.hasDeliveryPoint = ko.computed(function () {
return self.deliveryPointList().length > 0;
});
self.regionSelector.registerChangeHandler(function (optionSelector, optionLevel) {
if (optionLevel.currentOptionId()) {
self.loadRegionChildren(optionLevel.currentOptionId());
self.loadDeliveryPoint(optionLevel.currentOptionId());
self.deliveryPointRegionId(optionLevel.currentOptionId());
}
});
self.selectDeliveryPoint = function (deliveryPoint) {
self.selectedDeliveryPointId(deliveryPoint.id());
self.setCurrentDeliveryPoint(deliveryPoint);
};

self.getCurrentDeliveryPoint = function () {
var deliveryPoint = null;
$.each(self.deliveryPointList(), function (index, elem) {
if (elem.id() == self.selectedDeliveryPointId()) {
deliveryPoint = elem;
}
});
return deliveryPoint;
};

self.setDeliveryPointList = function (deliveryPointList) {
self.deliveryPointList(deliveryPointList);
};

self.loadRegionChildren = function (regionId) {
$.post(AppConfig.getRegionChildrenUrl, {regionId: regionId}, function (ret) {
if (ret.state == 'ok') {
self.regionSelector.addOptionLevel(ret.regionLevel);
}
}, "JSON");
};

self.loadRegion = function (regionId) {
$.post(AppConfig.getRegionLevelsUrl, {regionId: regionId || "c_region_1602"}, function (ret) {
if (ret.state == 'ok') {
self.regionSelector.setOptionLevels(ret.regionLevels);
}
}, "JSON");
};

self.setCurrentDeliveryPoint = function (deliveryPoint) {
self.currDeliveryPoint(deliveryPoint);
self.loadRegion(deliveryPoint.regionId())
};
self.loadDeliveryPoint = function (regionId) {
$.post("/templates/public/shopping/handle/v3/loadDeliveryPoint.jsp", {
regionId: regionId || "c_region_1602",
merchantId: self.merchantId
}, function (ret) {
if (ret.state) {
var deliveryPoints = $.map(ret.points || [], function (r) {
return new DeliveryPoint(r);
});
self.setDeliveryPointList(deliveryPoints);
} else {
self.setDeliveryPointList([]);
self.noDeliveryPointDesc(ret.errorMsg);
}
}, "JSON");
};
}


function Address(address) {
var self = this;
var address = address || {};
self.userName = ko.observable(address.userName);
self.regionName = ko.observable(address.regionName);
self.id = ko.observable(address.id);
self.postCode = ko.observable(address.postCode);
self.mobile = ko.observable(address.mobile);
self.regionId = ko.observable(address.regionId);
self.address = ko.observable(address.address);
self.selectedDeliveryRuleId = ko.observable(address.selectedDeliveryRuleId);
self.userLongitude = ko.observable(address.userLongitude);
self.setData = function (data) {
var data = data || {};
self.userName(data.userName);
self.id(data.id);
self.postCode(data.postCode);
self.mobile(data.mobile);
self.regionId(data.regionId);
self.address(data.address);
self.selectedDeliveryRuleId(data.selectedDeliveryRuleId);
self.regionName(data.regionName);
self.userLongitude(data.userLongitude);
}
}

function PayRec() {
var self = this;
self.payInterfaceId = "";
self.name = "";
self.money = "";
}

function OrderForm() {
var self = this;
self.deliveryAddress = new Address();
self.invoice = ko.observable(new Invoice());
self.memo = ko.observable();
self.addingOrder = ko.observable(false); //正在添加订单，防止多次点击添加订单按钮
self.savingPayWayState = ko.observable(false);//正在保存地址，防止多次点击触发
self.cartId = "";
self.orderId = ko.observable("");
self.cartType = "";
self.buyerId = "";

self.buyerMobile = "";
self.paymentSelected = ko.observable(false);
self.selectedPayments = ko.observableArray([]);
self.selectedOcPayments = ko.observableArray();
self.selectedPayInterfaceId = ko.observable();
self.ocs = ko.observableArray();

self.crossOrderRuleResults = ko.observableArray();

self.useLayer = ko.computed(function () {
if($.layer){
return false;
}
return false;
});

self.serverTime = ko.observable(Date.now());
self.getWjsPrefix = ko.observable((new Date().getMonth() + 1) + '月' + new Date().getDate() + '日');
self.wjsTimeSlots = ko.observableArray([]);
if (AppConfig && AppConfig.timeSlots) {
$.post(AppConfig.baseUrl + AppConfig.getServerTimeUrl, null).done(function (ret) {
var data = JSON.parse(ret);
if (data && data.t) self.serverTime(parseInt(data.t));

function mapResult(timeSlots, now) {
var dup = new Date(parseInt(data.t));
return JSON.parse(timeSlots).map(function (value) {
var timeRange = parseTimeRange(value.content);
return {
value: {
start: now.setHours(timeRange.startHour, timeRange.startMinute),
end: now.setHours(timeRange.endHour, timeRange.endMinute)
},
text: self.getWjsPrefix() + " " + value.content,
enable: dup.getTime() > now.setHours(timeRange.startHour, timeRange.startMinute) ? 'true' : 'false'
}
});
}

self.wjsTimeSlots((function () {
var now = new Date(parseInt(data.t)),
timeSlots = AppConfig.timeSlots || '';
if (timeSlots) {
var timeSlotsList = JSON.parse(timeSlots);
var lastestTime = parseTimeRange(timeSlotsList[timeSlotsList.length - 1].content);
var lastLong = now.setHours(lastestTime.startHour, lastestTime.startMinute);
var useTomorrow = false;
//if(dup.getTime() > lastLong){
//    useTomorrow = true;
//    now.setDate(now.getDate()+1);
//    self.getWjsPrefix(now.getDate()+'月'+(now.getMonth()+1)+'日');
//}

// 今天
var result = mapResult(timeSlots, now);

// 明天
now.setDate(now.getDate() + 1);
self.getWjsPrefix((now.getMonth() + 1) + '月' + now.getDate() + '日');
result = result.concat(mapResult(timeSlots, now));

// 后天
now.setDate(now.getDate() + 1);
self.getWjsPrefix((now.getMonth() + 1) + '月' + now.getDate() + '日');
result = result.concat(mapResult(timeSlots, now));

result = result.filter(function (value) {
return value.enable === 'false';
});

result = result.slice(0, 8);
return result;
} else {
return [];
}
})());
});
}
// 是不是万家送订单
self.isFastDelivery = ko.computed(function () {
if (window.AppConfig) {
return AppConfig.isFastDelivery;
} else {
return false;
}
});

//是不是OLE订单
self.isOLE = ko.computed(function () {
if (window.AppConfig) {
return AppConfig.isOLE;
} else {
return false;
}
});

self.isWjsDeliveryPoint = ko.computed(function () {
if (self.isFastDelivery() && self.ocs().length == 1) {
var oc = self.ocs()[0];
if (oc.selectedDeliveryRule() && oc.selectedDeliveryRule().supportDP() && !oc.isEmpty()) {
return true;
} else {
return false;
}
}
return false;
});

/*
* 初始化万家送特别的自提点，初始化后要一直忘下传，直到selector
* 下一站bean.js -> function Oc(){}-> self.wjsDeliveryPoints = ko.observable();
*/
function initWjsDeliveryPoints(ocs) {
if (self.isFastDelivery() || self.isOLE()) {
$.post("/templates/public/shopping/handle/v3/loadDeliveryPoint.jsp", {
merchantId: AppConfig.merchantId
}, function (ret) {
if (ret.state) {
var deliveryPoints = $.map(ret.points || [], function (r) {
return new DeliveryPoint(r);
});
ocs.forEach(function (value) {
value.wjsDeliveryPoints(deliveryPoints);
})
}
}, 'json');
}
}

var parseTimeRange = function (timeRange) { // 12:22~14:44
return {
startHour: parseInt(timeRange.replace(/\s/g, '').replace(/~.*/g, '').replace(/:\d{2}/g, '')), // 12
startMinute: parseInt(timeRange.replace(/\s/g, '').replace(/~.*/g, '').replace(/^\d{2}:/g, '')), // 22
endHour: parseInt(timeRange.replace(/\s/g, '').replace(/^.*~/g, '').replace(/:\d{2}/g, '')), // 14
endMinute: parseInt(timeRange.replace(/\s/g, '').replace(/^.*~/g, '').replace(/^\d{2}:/, '')) // 44
}
}

self.chosenWjsTimeSlot = ko.observable();
self.wjsTimeRange = function () {
var now = new Date(self.serverTime());
var hours = now.getHours();
var minutes = now.getMinutes();
var val = hours * 100 + minutes;

var nowStr = now.toLocaleString('zh-CN');
nowStr = nowStr.replace(/\s.*/g, '');


var dpta = AppConfig.wjsdpta || '10:00~12:00',
dptp = AppConfig.wjsdptp || '17:30~19:00',
dptea = AppConfig.wjsdptea || '09:00',
dptep = AppConfig.wjsdptep || '16:00';


var v1 = parseInt(dptea.replace(/[^\d]+/g, ''), 10),
v2 = parseInt(dptep.replace(/[^\d]+/g, ''), 10),
amTimeRange = parseTimeRange(dpta),
pmTimeRange = parseTimeRange(dptp);

if (val <= v1 && val < v2) {
return [
{
text: dpta,
value: {
start: now.setHours(amTimeRange.startHour, amTimeRange.startMinute),
end: now.setHours(amTimeRange.endHour, amTimeRange.endMinute)
}
},
{
text: dptp,
value: {
start: now.setHours(pmTimeRange.startHour, pmTimeRange.startMinute),
end: now.setHours(pmTimeRange.endHour, pmTimeRange.endMinute)
}
}
];
} else if (val > v1 && val <= v2) {
return [
{
text: dptp,
value: {
start: now.setHours(pmTimeRange.startHour, pmTimeRange.startMinute),
end: now.setHours(pmTimeRange.endHour, pmTimeRange.endMinute)
}
}
];
} else if (val > v2) {
return [
{
text: '现在不在自提时间'
}
];
}
};
self.couldChosenWjsDeliveryPoint = ko.computed(function () {
var endHour = (AppConfig.wjsdptep || '16:00').replace(/:\d{2}/g, '');
var endMinute = (AppConfig.wjsdptep || '16:00').replace(/^\d{2}:/g, '');
var endTimeStep = new Date(self.serverTime()).setHours(endHour, endMinute, '00');
return endTimeStep > self.serverTime();
});

self.chosenWjsTimeRange = ko.observable(self.wjsTimeRange()[0]);

/*是否含有跨境订单*/
self.isCrossBorder = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.isCrossBorder && !oc.isEmpty()) {
return true;
}
}
});

/*是否含有跨境直邮订单*/
self.isCrossDirectMail = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
//console.log("oc.isCrossDirectMail=",oc.isCrossDirectMail);
if (oc.isCrossDirectMail && !oc.isEmpty()) {

return true;
}
}
});

/*是不是全部都是跨境订单*/
self.isAllCrossBorder = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (!oc.isCrossBorder) {
return false;
}
}
return true;
});

self.isGift = ko.computed(function () {
return window.isGift;
});

self.isB2BMember = ko.observable(false);
/*是否b2b会员*/
self.billType = ko.observable("com");
/*发票类型：默认普通发票*/
/*是不是含有b2b订单*/
self.isB2BOrder = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.isB2BOrder) {
return true;
}
}
});

/*是不是全部都是b2b订单*/
self.isAllB2BOrder = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (!oc.isB2BOrder) {
return false;
}
}
return true;
});

self.supportIntegral = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.supportIntegral) {
return true;
}
}
return false;
});

self.supportJiaJuQuan = ko.computed(function () {
return true;
});

self.supportStoreCard = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.supportStoreCard) {
return true;
}
}
return false;
});

/*是否所有的oc都支持预付卡支付*/
self.isAllOcsSupportStoreCard = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (!oc.supportStoreCard) {
return false;
}
}
return true;
});

self.supportPreDeposit = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.supportPreDeposit) {
return true;
}
}
return false;
});

self.supportTicket = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.supportTicket) {
return true;
}
}
return false;
});

self.addOrderState = ko.computed(function () {
if (self.addingOrder()) {
return "订单提交中...";
} else {
return "提交订单";
}
});
/***收货人信息***/
self.consignee = new Consignee();
self.consignee.callback = function (consigneeAddress) {
self.loadOrderForm(self.cartId, self.buyerId);
self.certificate(self.consignee.currConsignee().certificate());
//编辑完配送人，就必须修改支付与配送方式
if (AppConfig.platform && AppConfig.platform == "mobile") {
self.editingConsignee(false);
} else {
self.editDeliveryAndPayment();
}

};
self.editingConsignee = ko.observable(false);
self.editConsignee = function () {
self.consignee.buyerId = self.buyerId;
self.consignee.selectedAddressId(self.deliveryAddress.id());
self.consignee.getConsigneeList();
self.editingConsignee(true);
self.editingDeliveryAndPayment(false);
};
/*** 收货人信息结束 ***/

/**
* 身份证信息 姓名,身份证号 begin
*/
/*身份证号码begin*/
self.certificate = ko.observable();
/*身份证号码*/
self.saveCertificate = ko.observable(true);
/*默认不保存身份证信息*/
/*初始化身份证读卡器,并读取身份证信息*/
self.readCertificate = function () {
if (!self.certificateReader) {
self.certificateReader = new ReadCertificate(self);
}
self.certificateReader.readCard();
};
self.editingCertificate = ko.observable(true);
self.updateCertificate = function () {
self.editingCertificate(true);
};
self.confirmCertificate = function () {
var result = self.validateCertificate();
if (result.state != "ok") {
if (self.useLayer()) {
layer.alert(result.msg);
} else {
confirmDialog.show(result.msg, function () {
});
}
return;
}
var postData = {};
postData.addressId = self.deliveryAddress && self.deliveryAddress.id();
postData.certificate = self.certificate();
$.post("/buyflowApi/handler/order/saveCertificate.jsx", postData, function (ret) {
if (ret.state == "ok") {
self.editingCertificate(false);
self.loadOrderForm(self.cartId, self.buyerId);
} else {
if (self.useLayer()) {
layer.alert(ret.msg);
} else {
confirmDialog.show(ret.msg, function () {
});
}
}
}, 'json');
};
self.validateCertificate = function () {
var result = {
state: "err"
};
if (!self.certificate()) {
result.msg = "请输入收货人真实的身份证号！";
return result;
}
var reg = /(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
var certificate = self.certificate();
if (certificate) {
certificate = certificate.trim();
//将小写x转换成大写X
certificate = certificate.replace("x", "X");
}
if (reg.test(certificate) === false) {
result.msg = "请输入真实的18位身份证号！";
return result;
}
self.certificate(certificate);
if (!IdentityCodeValid(self.certificate())) {
result.msg = "身份证验证错误，请输入收货人真实的身份证号！";
return result;
}
result.state = "ok";
return result;
};
/*显示身份证号码的时候，隐藏中间几位*/
self.convertCertificate = ko.computed(function () {
if (self.certificate()) {
var certificate = self.certificate();
if (certificate.length <= 8) {
return certificate;
}
var newCertificate = certificate.substr(0, 4);
newCertificate += "**********";
newCertificate += certificate.substr(certificate.length - 4, 4);
return newCertificate;
}
return "";
});
/*身份证号码end*/
/*收货人姓名begin*/
self.receiveUserName = ko.observable(self.deliveryAddress && self.deliveryAddress.userName() || "");
self.editingUserName = ko.observable(false);
self.updateUserName = function () {
self.editingUserName(true);
};
self.saveUserName = function () {
if (!self.receiveUserName()) {
self.receiveUserName(self.deliveryAddress && self.deliveryAddress.userName());
self.editingUserName(false);
return;
}
if (self.receiveUserName() == self.deliveryAddress.userName()) {
self.editingUserName(false);
return;
}
var postData = {
addressId: self.deliveryAddress && self.deliveryAddress.id(),
userName: self.receiveUserName(),
certificate: self.certificate()

};
$.post(AppConfig.url + AppConfig.updateAddressUserNameUrl, postData, function (ret) {
if (ret.state != "ok") {
if (self.useLayer()) {
layer.alert(ret.msg);
} else {
confirmDialog.show(ret.msg, function () {
});
}
} else {
self.deliveryAddress.userName(self.receiveUserName());
self.editingUserName(false);
}
}, "JSON");
};
/*收货人姓名end*/

/*身份证正反面begin*/
self.idCardFrontPic = ko.observable("");
self.idCardFrontPicPreviewPath = ko.observable("");
self.idCardFrontPicPreviewFullPath = ko.observable("");
self.idCardBackPic = ko.observable("");
self.idCardBackPicPreviewPath = ko.observable("");
self.idCardBackPicPreviewFullPath = ko.observable("");

self.selectIdCardFrontPic = function () {
return $("#idCardFrontPic").click();
};

self.selectIdCardBackPic = function () {
return $("#idCardBackPic").click();
};
/*身份证正反面end*/

/**
* 身份证信息 end
*/
self.firstTime = ko.observable(false);

/***支付方式***/
self.payRecs = ko.observableArray();

self.updatePayRec = function (payRec) {
var temRecs = [];
var found = false;
$.each(self.payRecs(), function (idx, old) {
if (old.payInterfaceId == payRec.payInterfaceId) {
if (payRec.money && payRec.money > 0) {
temRecs.push(payRec);
found = true;
}

}
else {
temRecs.push(old);
}
});
if (!found) {
if (payRec.money && payRec.money > 0) {
temRecs.push(payRec);
}
}
self.payRecs(temRecs);
//如果订单待支付金额小于1元,并且订单的成交金额大于1元
if (Number(self.leftPayAmount()) < AppConfig.leftCashPayAmount && Number(self.finalPayAmount()) >= AppConfig.leftCashPayAmount) {
if (self.useLayer()) {
layer.alert("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整其他支付方式使用金额.");
}
else {
confirmDialog.show("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整其他支付方式使用金额.", function () {
});
}
return;
}
for (var k in self.pluginItems) {
var plugin = self.pluginItems[k];
plugin.onOrderFormChanged(self);
}
};

self.hasExtraPayRecs = ko.computed(function () {
if (self.payRecs() && self.payRecs().length > 0) {
return true;
}
return false;
});


/***支付和配送信息***/
self.selectedDeliveryTimeId = ko.observable("");
self.selectedDeliveryTimeName = ko.observable("");

self.editingDeliveryAndPayment = ko.observable(false);
self.editDeliveryAndPayment = function () {
self.editingConsignee(false);
self.editingDeliveryAndPayment(true);
};
self.paymentDesc = ko.observable("");
self.selectedPaymentName = ko.computed(function () {
if (self.selectedPayments() && self.selectedPayments().length > 0) {
if (self.selectedPayments().length == 1) {
return self.selectedPayments()[0].payment.name;
} else {
var result = "";
$.each(self.selectedPayments(), function (i, payment) {
if (i == 0) {
result += payment.payment.name;
} else {
result += "+" + payment.payment.name;
}
});
return result;
}
}
return "";
});
self.initedWjsPaymentAndDeliveryRule = ko.observable(false);
self.saveSelectedPaymentAndDeliveryRule = function () {
if (self.savingPayWayState()) {
return;
}
var merIdRuleIdPairs = [];
var allDeliveryRuleSelected = true;
var allDeliveryTimeSelected = true;
var allDeliveryPointSelected = true;

//        self.fastDeliveryTimeRange($("#deliveryTimeRange").val());

if (!self.selectedDeliveryTimeId() && !self.isCrossBorder() && !self.isFastDelivery() && !self.notRequireDeliveryTime && !self.isGift()) {
if (self.useLayer()) {
layer.alert("请选择配送时间！");
} else {
confirmDialog.show("请选择配送时间！", function () {
});
}
self.editingDeliveryAndPayment(true);
return;
}

if (!self.deliveryPointSelected() && self.wjsTimeRange()[0].text == '现在不在自提时间') {
if (self.useLayer()) {
layer.alert("不在自提时间范围,请选择配送到家！");
}
else {
confirmDialog.show("不在自提时间范围,请选择配送到家！", function () {
});
}
return;
}
$.each(self.ocs(), function (i, oc) {
if (!oc.selectedDeliveryTimeId()) {
allDeliveryTimeSelected = false;
} else {
oc.selectedDeliveryTimeId(self.selectedDeliveryTimeId());
oc.selectedDeliveryTimeName(self.selectedDeliveryTimeName());
}
//如果选中的配送规则是支持自提点的，但是并没有选中自提点
if (!self.deliveryPointSelected()) {
allDeliveryPointSelected = false;
}
});
$.each(self.ocs(), function (i, oc) {
if (!oc.selectedDeliveryRuleId()) {
allDeliveryRuleSelected = false;
}
merIdRuleIdPairs.push({
merchantId: oc.merchantId(),
ruleId: oc.selectedDeliveryRuleId(),
deliveryPointId: oc.selectedDeliveryPointId(),
deliveryPointRegionId: oc.selectedDeliveryPointRegionId(),
deliveryTimeId: self.selectedDeliveryTimeId(),
cartId: oc.cartId
});
});

/* 防止pc端弹窗 */
if (!allDeliveryRuleSelected && !self.isFastDelivery()) {
if (self.useLayer()) {
layer.alert("请选择配送方式！");
}
else {
confirmDialog.show("请选择配送方式！", function () {
});
}
self.editingDeliveryAndPayment(true);
return;
}

if (!allDeliveryPointSelected) {
if (self.useLayer()) {
layer.alert("请选择自提点！");
}
else {
confirmDialog.show("请选择自提点！", function () {
});
}
self.editingDeliveryAndPayment(true);
return;
}
self.savingPayWayState(true);
$.post(AppConfig.url + AppConfig.saveSelectedPaymentAndDeliveryRuleUrl, {
addressId: self.deliveryAddress.id(),
buyerId: self.buyerId,
selectedPayInterfaceId: self.selectedPayInterfaceId(),
merIdRuleIdPairs: JSON.stringify(merIdRuleIdPairs)

}, function (ret) {
self.savingPayWayState(false);
if (ret.state == 'ok') {
self.loadOrderForm(self.cartId, self.buyerId);
self.editingDeliveryAndPayment(false);
self.initedWjsPaymentAndDeliveryRule(true);
self.initedWjsPaymentAndDeliveryRule(true);
}
else if (ret.state == 'err' && ret.msg == 'notLogin') {
$(document).trigger("notLogin");
}
}, "json");
};
/***支付和配送信息结束***/

/*** invoice ***/
self.invoiceChooser = new InvoiceChooser();
self.invoiceChooser.callback = function (consigneeAddress) {
self.editingInvoice(false);
self.loadOrderForm(self.cartId, self.buyerId);
};
self.editingInvoice = ko.observable(false);
self.editInvoice = function () {
self.invoiceChooser.buyerId = self.buyerId;
self.invoiceChooser.getInvoiceList();
self.invoiceChooser.selectedInvoiceId(self.invoice().id());
self.invoiceChooser.setCurrentInvoice(self.invoice());
self.editingInvoice(true);
};

self.pluginItems = {
"integralPay": new PluginItemIntegralPay(),
//"jiaJuQuanPay": new PluginItemJiaJuQuanPay(),
"useTicket": new PluginItemUseTicket(),
//"prepayCard": new PluginItemPrepayCard(),
"preDeposit": new PluginItemPreDepositPay()
};

for (var k in self.pluginItems) {
var plugin = self.pluginItems[k];
plugin.onInit(self);
}

self.carts = new Carts();
self.carts.readOnly(true);
self.carts.isCheckingOut(true);
self.totalOrderProductPrice = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.totalOrderProductPrice();
}
return sum.toFixed(2);
});

self.totalDeliveryFee = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.totalDeliveryFee();
}
return sum.toFixed(2);
});

self.totalProductDiscount = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.totalProductDiscount();
}
return sum.toFixed(2);
});

self.totalOrderDiscount = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.totalOrderDiscount();
}
return sum.toFixed(2);
});

self.totalDeliveryFeeDiscount = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.totalDeliveryFeeDiscount();
}
return sum.toFixed(2);
});

self.totalIntegralPrice = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.totalIntegralPrice();
}
return sum.toFixed(2);
});

//订单的成交价格
self.finalPayAmount = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
sum += oc.finalPayAmount();
}
return sum;
});
//已支付金额
self.paidAmount = ko.computed(function () {
var sum = 0;
$.each(self.payRecs(), function (idx, payRec) {
sum += Number(payRec.money);
});
return sum;
});
//剩余未支付金额
self.leftPayAmount = ko.computed(function () {
var ret = self.finalPayAmount() - self.paidAmount();
if (ret < 0) {
ret = 0;
}
return ret.toFixed(2);
});
//使用积分金额(钱)
self.usedIntegralAmount = ko.computed(function () {
var sum = 0;
$.each(self.payRecs(), function (idx, payRec) {
if (payRec.payInterfaceId == 'payi_4') {
sum += Number(payRec.money);
}
});
return sum;
});
//使用购物券金额
self.usedTicketAmount = ko.computed(function () {
var sum = 0;
$.each(self.payRecs(), function (idx, payRec) {
if (payRec.payInterfaceId == 'payi_2') {
sum += Number(payRec.money);
}
});
return sum;
});
//使用储值卡金额
self.usedPrepayCardAmount = ko.computed(function () {
var sum = 0;
$.each(self.payRecs(), function (idx, payRec) {
if (payRec.payInterfaceId == 'payi_10') {
sum += Number(payRec.money);
}
});
return sum;
});
//使用品牌家居券金额
self.usedJiaJuQuanAmount = ko.computed(function () {
var sum = 0;
$.each(self.payRecs(), function (idx, payRec) {
if (payRec.payInterfaceId == 'payi_160') {
sum += Number(payRec.money);
}
});
return sum;
});
self.totalDiscount = ko.computed(function () {
return (Number(self.totalOrderProductPrice()) + Number(self.totalDeliveryFee()) - Number(self.finalPayAmount())).toFixed(2);
});
/*所有的税金*/
self.totalTaxPrice = ko.computed(function () {
var sum = 0;
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
if (oc.isCollectTax && oc.needPayTax()) {
sum += oc.totalTaxPrice();
}
}
return sum.toFixed(2);
});
/*是否需要支付税金*/
self.needPayTax = ko.computed(function () {
return Number(self.totalTaxPrice()) > Number(AppConfig.maxTaxPrice);
});
/*原来需要支付的金额加上税金*/
self.leftPayAmountInclucdTax = ko.computed(function () {
var leftPayAmount = Number(self.leftPayAmount());
var totalTaxPrice = Number(self.totalTaxPrice());
/*如果税金大于50才需要一起结算*/
if (self.needPayTax()) {
leftPayAmount += totalTaxPrice;
}
return leftPayAmount.toFixed(2);
});

//跳到购物车
self.goCart = function () {
window.location.href = AppConfig.cartUrl;
};

self.askForPayment = function () {
orderFormPayment.buyerId = self.buyerId;
orderFormPayment.merchantId = self.merchantId;
orderFormPayment.callback = function () {
window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
};
orderFormPayment.init(self.payments(), self.selectedPaymentId());
window.location.href = "#/orderFormPayment";
};
self.askForInvoice = function () {
invoiceChooser.buyerId = self.buyerId;
invoiceChooser.merchantId = self.merchantId();
invoiceChooser.callback = function () {
window.location.href = "#/orderForm/" + self.cartId + "/" + self.buyerId;
};
invoiceChooser.getInvoiceList();
invoiceChooser.selectedInvoiceId(self.invoice().id());
window.location.href = "#/invoice";
};
self.askForMemo = function () {
self.currentPage("orderFormMemo");
};
self.availablePayments = ko.computed(function () {
//所有的支付方式取并集
var payments = [];
var paymentMap = {};
$.each(self.ocs(), function (i, oc) {
$.each(oc.paymentList(), function (j, payment) {
paymentMap[payment.payInterfaceId] = payment;
});
});
for (k in paymentMap) {
var p = paymentMap[k];
payments.push(p);
}
return payments;
});
self.calculateEffectivePayments = function (requestedPayInterfaceId) {
var paymentMap = {};
var pendingOcs = [];
var noValidPayment = false;
var desc = "因您的订单中含有";
var merchants = '';
self.paymentDesc('');
var hasNotFound = false;
for (var idx = 0; idx < self.ocs().length; idx++) {
var oc = self.ocs()[idx];
//1.如果用户有要求一种支付方式，那么如果商家支持这种支付方式，那么就选择这种支付方式
var found = false;
for (var i = 0; i < oc.paymentList().length; i++) {
var payment = oc.paymentList()[i];
if (requestedPayInterfaceId && payment.payInterfaceId == requestedPayInterfaceId) {
//如果商家支持，并且是货到付款，那么还需要判断所选择的支付方式是否货到付款。
if (requestedPayInterfaceId == 'payi_0') {
//是货到付款，判断选择的配送方式是否支持货到付款
if (oc.selectedDeliveryRuleEnableCod()) {
found = true;
break;
}
else {
break;
}
}
else {
found = true;
break;
}
}
}
if (found) {
if (!paymentMap[requestedPayInterfaceId]) {
paymentMap[requestedPayInterfaceId] = {
payment: oc.selectedPayment(),
totalProductNumber: oc.totalProductNumber()
}
} else {
paymentMap[requestedPayInterfaceId].totalProductNumber += oc.totalProductNumber();
}
}
//1.1如果商家不支持这种方式，那么自动选择一种商家支持的方式
if (!found) {
if (oc.paymentList() && oc.paymentList().length > 0) {
var payment = null;
var payInterfaceId = null;
for (var i = 0; i < oc.paymentList().length; i++) {
var payment = oc.paymentList()[i];
var payInterfaceId = payment.payInterfaceId;
//选择任意一种，只要不等于requestedPayInterfaceId
if (payInterfaceId != requestedPayInterfaceId) {
found = true;
break;
}
}
if (!paymentMap[payInterfaceId]) {
paymentMap[payInterfaceId] = {
payment: payment,
totalProductNumber: oc.totalProductNumber()
}
} else {
paymentMap[payInterfaceId].totalProductNumber += oc.totalProductNumber();
}
if (found && requestedPayInterfaceId == "payi_0") {
hasNotFound = true;
merchants += oc.merchantName() + ",";
}
}
}
if (!found) {
//商家根本没有可用的支付方式
noValidPayment = true;
}

}
//如果选择的是货到付款,但是存在有某个商家不支持货到付款,那么就提示,商家不支持货到付款
if (hasNotFound) {
merchants = merchants.substring(0, merchants.lastIndexOf(","));
desc += merchants + "的商品,恕不支持货到付款";
self.paymentDesc(desc);
}
if (noValidPayment) {
return null;
}
var ret = [];
for (payInterfaceId in paymentMap) {
var payment = paymentMap[payInterfaceId];
ret.push(payment);
}
return ret;
};
self.calculateEffectivePayments2 = function (selectedOcPayments) {
if (!selectedOcPayments) {
return null;
}

var ret = [];
var existsObj = {};
for (var idx = 0; idx < self.ocs().length; idx++) {
var oc = self.ocs()[idx];
var cartKey = oc.cartId;
var selectPaymentId = selectedOcPayments[cartKey];
for (var i = 0; i < oc.paymentList().length; i++) {
var payment = oc.paymentList()[i];
var payInterfaceId = payment.payInterfaceId;
if (selectPaymentId == payInterfaceId && !existsObj[payInterfaceId]) {
var obj = {
payment: payment,
totalProductNumber: oc.totalProductNumber()
};
existsObj[payInterfaceId] = true;
ret.push(obj);
}
}
}
return ret;
};
self.deliveryRuleSelected = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
//有选中商品结算的才需要判断
if (!oc.selectedDeliveryRuleId() && !oc.isEmpty()) {
return false;
}
}
return true;
});
self.setDeliveryTime = function (rule) {
if (rule) {
self.selectedDeliveryTimeId(rule.id());
self.selectedDeliveryTimeName(rule.name());
} else {
self.selectedDeliveryTimeId("");
self.selectedDeliveryTimeName("");
}
return true;
};
self.selectDeliveryTime = function (ruleId) {
if (!self.deliveryTimes()) {
self.setDeliveryTime(null);
return;
}
if (!ruleId) {
self.setDeliveryTime(null);
return;
}
var r = null;
$.each(self.deliveryTimes(), function (idx, rule) {
if (rule.id() == ruleId) {
r = rule;
}
});
if (r == null) {
self.setDeliveryTime(null);
}
else {
self.setDeliveryTime(r);
}
};
self.deliveryTimeSelected = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
//有选中商品结算的才需要判断
if (!oc.selectedDeliveryTimeId() && !oc.isEmpty() && !self.isCrossBorder()) {
return false;
}
}
return true;
});
self.deliveryPointSelected = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
//如果是支持自提点，但是没有选择自提点
var theSelectedDeliveryRule = oc.selectedDeliveryRule();
if (theSelectedDeliveryRule && theSelectedDeliveryRule.supportDP() && !oc.isEmpty()) {
if(!theSelectedDeliveryRule.deliveryPointSelector.hasDeliveryPoint() || !oc.selectedDeliveryPointId()){
return false;
}
}

}
return true;
});
//初始化配送时间
self.deliveryTimes = ko.computed(function () {
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
return oc.deliveryTimes ? oc.deliveryTimes() : [];
}
});
self.totalPromotionPrice = ko.observable();
self.loadOrderForm = function (cartId, buyerId) {
self.addingOrder(false);

var postData = {
cartId: cartId,
merchantId: AppConfig.merchantId,
selectedAddressId: self.deliveryAddress && self.deliveryAddress.id(),
exm: AppConfig.exMerchantId,
merchantType: AppConfig.merchantType,
mergerCart: AppConfig.mergerCart,
isFastDelivery: self.isFastDelivery(),
isGift: window.isGift,
giftRegionId: window.giftRegionId
};

if (buyerId) {
postData.buyerId = buyerId;
}
self.cartId = cartId;
self.buyerId = buyerId;
self.carts.buyerUserId(buyerId);
self.carts.loadCarts();
$.post(AppConfig.url + AppConfig.orderFormUrl, postData, function (ret) {
if (ret.state == 'err') {
if (ret.msg == 'notlogin') {
if (AppConfig.platform && AppConfig.platform == "mobile") {
$(document).trigger("notLogin");
} else {
window.location.href = AppConfig.loginUrl;
}
return;
}
if (parent && parent.App && parent.App.toast) {
parent.App.toast.error("出现错误！" + ret.msg);
}
else {
alert("出现错误！" + ret.msg);
}

if (AppConfig.platform && AppConfig.platform == "mobile") {
if (AppConfig.indexUrl.charAt(0) == '#') {
parent.window.location.hash = AppConfig.indexUrl;
}
else {
parent.window.location.href = AppConfig.indexUrl;
}

} else {
window.location.href = "/";
}
return;
}
if (ret.state == "ok" && ret.ocs.length == 0) {
self.addingOrder(false);
if (AppConfig.platform && AppConfig.platform == "mobile") {
if (AppConfig.platform_aom && AppConfig.platform_aom == "app") { // app or mobile
parent.native.goHomePage();
} else {
if (AppConfig.indexUrl.charAt(0) == '#') {
parent.window.location.hash = AppConfig.indexUrl;
}
else {
parent.window.location.href = AppConfig.indexUrl;
}
}
} else {
window.location.href = "/";
}
return;
}
self.buyerId = buyerId;
self.buyerMobile = ret.buyerMobile || "";//下单人手机号码
self.invoice(new Invoice(ret.invoiceInfo));
self.invoice().orderForm(self);
/*发票信息*/

/*设置默认支付方式*/
if (ret.ocs) {
var ocs = [];
$.each(ret.ocs, function (idx, oc) {
if (self.isFastDelivery()) {
oc.isFastDelivery = true;
}
var o = new Oc(oc);
if (!o.isEmpty()) {
ocs.push(o);
}
});
self.ocs(ocs);
}
self.crossOrderRuleResults(ret.crossOrderRuleResults);

initWjsDeliveryPoints(self.ocs());

if (!self.ocs() || self.ocs().length == 0) {
if (parent && parent.App && parent.App.toast) {
parent.App.toast.error("购物车是空的。");
}
else {
alert("购物车是空的。" + ret.msg);
}
if (AppConfig.platform && AppConfig.platform == "mobile") {
if (AppConfig.platform_aom && AppConfig.platform_aom == "app") {
parent.native.goHomePage();

} else {
window.location.href = AppConfig.indexUrl;
}
} else {
window.location.href = "/";
}
return;
}
//如果没有选中的配送规则,那就要用户选择配送规则
if (!self.deliveryRuleSelected() || !self.deliveryTimeSelected() || !self.deliveryPointSelected()) {
if (!AppConfig.platform || AppConfig.platform != "mobile") {
self.editDeliveryAndPayment();
}
}
for (k in self.pluginItems) {
var plugItem = self.pluginItems[k];
plugItem.onUpdate(ret);
}
if (ret.deliveryAddress == null) {
self.deliveryAddress.setData({});
//如果是转赠订单，就不需要再选择地址
if (!window.isGift) {
self.editConsignee();
self.firstTime(true);
self.consignee.newConsignee();
$(document).trigger("orderFormLoaded");
return;
}
}
else {
self.firstTime(false);
self.deliveryAddress.setData(ret.deliveryAddress);
self.certificate(ret.deliveryAddress.certificate || "");
self.idCardFrontPic(ret.deliveryAddress.idCardFrontPic || "");
self.idCardFrontPicPreviewPath(ret.deliveryAddress.idCardFrontPicPreviewPath || "");
self.idCardFrontPicPreviewFullPath(ret.deliveryAddress.idCardFrontPicPreviewFullPath || "");
self.idCardBackPic(ret.deliveryAddress.idCardBackPic || "");
self.idCardBackPicPreviewPath(ret.deliveryAddress.idCardBackPicPreviewPath || "");
self.idCardBackPicPreviewFullPath(ret.deliveryAddress.idCardBackPicPreviewFullPath || "");
self.receiveUserName(self.deliveryAddress && self.deliveryAddress.userName() || "");
if (ret.deliveryAddress.certificate) {
self.editingCertificate(false);
} else {
self.editingCertificate(true);
}
}
//每个oc选择的支付方式
if (ret.selectedPayments) {
self.selectedOcPayments(ret.selectedPayments);
var payments = self.calculateEffectivePayments2(ret.selectedPayments);
if (payments != null && payments.length > 0) {
self.selectedPayments(payments);
self.selectedPayInterfaceId(payments[0].payment.payInterfaceId);
self.paymentSelected(true);
} else {
self.selectedPayments([]);
self.selectedPayInterfaceId("");
self.paymentSelected(false);
self.editDeliveryAndPayment();
}
} else {
self.paymentSelected(false);
//让用户选
self.editDeliveryAndPayment();
}

//如果只有一个配送时间,那就选中它
if (self.deliveryTimes() && self.deliveryTimes().length == 1) {
self.setDeliveryTime(self.deliveryTimes()[0]);
} else {
if (self.ocs() && self.ocs().length > 0) {
self.selectDeliveryTime(self.ocs()[0].selectedDeliveryTimeId());
}
}
self.isB2BMember(ret.isB2bMember);
self.billType(ret.billType);
self.totalPromotionPrice(ret.totalPromotionPrice || 0);//优惠金额
$(document).trigger("orderFormLoaded");
}, "json");

};

self.checkRange = function () {
if (self.isFastDelivery() && !self.isWjsDeliveryPoint() && AppConfig.merchantType == "EWJ_WJS") {
var address = self.deliveryAddress.regionName() + self.deliveryAddress.address();
var userLongitude = self.deliveryAddress.userLongitude() || "";
$.when($.post(AppConfig.baseUrl + "phone_page/checkRange.jsp", {
merchantId: AppConfig.merchantId,
address: address,
userLongitude: userLongitude
})).then(function (ret) {
var data = JSON.parse(ret);
if (data.status == 'ok') {
self.addOrder();
// 定时达暂时注释
//return $.post(AppConfig.baseUrl + AppConfig.getServerTimeUrl, null);
} else {
if (self.useLayer()) {
layer.alert("不在配送范围！");
}
else {
confirmDialog.show("不在配送范围！", function () {
});
}
}
})
// 定时达暂时注释
//    .then(function (ret) {
//        var data = JSON.parse(ret);
//        if (data && data.t) {
//            var serverTime = data.t;
//            //var serverTime = Date.now();
//            var last = self.chosenWjsTimeSlot().value.start;
//            if (serverTime > last) {
//                confirmDialog.show("已过配送时间，请重新选择配送时间");
//                self.editingDeliveryAndPayment(true);
//            } else {
//                self.addOrder();
//            }
//        }
//    }
//);
} else if (self.isFastDelivery() && self.isWjsDeliveryPoint()) {
$.post(AppConfig.baseUrl + AppConfig.getServerTimeUrl, {}, function (ret) {
if (ret.t) {
var serverTime = ret.t;
self.serverTime(parseInt(ret.t));
var endHour = (AppConfig.wjsdptep || '16:00').replace(/:\d{2}/g, '');
var endMinute = (AppConfig.wjsdptep || '16:00').replace(/^\d{2}:/g, '');
var endTimeStep = new Date(parseInt(ret.t)).setHours(endHour, endMinute, '00');
if (endTimeStep < serverTime) {
confirmDialog.show("选择门店自提，请在" + AppConfig.wjsdptep + "前下单");
if (self.ocs().length <= 1) {
if (!self.couldChosenWjsDeliveryPoint()) {
var tempdrs = self.ocs()[0].deliveryResults();
tempdrs.forEach(function (value) {
if (!value.supportDP()) {
self.ocs()[0].setDeliveryRule(value);
}
});
}
} else {
//throw new Error('万家送出现多商家结算');
}
self.editingDeliveryAndPayment(true);
return;
} else {
self.addOrder();
}
}
}, "json");
} else if (AppConfig.merchantType == "EWJ_OLE") {
if (1 * self.totalOrderProductPrice() < 1 * AppConfig.oleFeeLimit) {
confirmDialog.show('购物金额尚未达到ole送频道最低消费（' + AppConfig.oleFeeLimit + '元）', function () {

});
return;
}
self.addOrder();
} else {
self.addOrder();
}
};

self.addOrder = function () {
if (self.addingOrder()) {
return;
}
if (!self.deliveryAddress.id() && !window.isGift) {
if (self.useLayer()) {
layer.alert("请选收货人信息！");
}
else {
confirmDialog.show("请选收货人信息！", function () {
});
}
self.editConsignee();
return;
}
if (!self.deliveryAddress.userName() && !window.isGift) {
if (self.useLayer()) {
layer.alert("请填写收货人姓名！");
}
else {
confirmDialog.show("请填写收货人姓名！", function () {
});
}
self.editConsignee();
return;
}

if (self.isCrossBorder()) {
if (self.editingUserName()) {
if (self.useLayer()) {
layer.alert("请先保存收货人姓名！");
}
else {
confirmDialog.show("请先保存收货人姓名！");
}
return;
}
if (self.editingCertificate()) {
if (self.useLayer()) {
layer.alert("请正确输入身份证号码并保存！");
}
else {
confirmDialog.show("请正确输入身份证号码并保存！", function () {
});
}
return;
}
var result = self.validateCertificate();
if (result.state != "ok") {
if (self.useLayer()) {
layer.alert(result.msg);
} else {
confirmDialog.show(result.msg, function () {
});
}
return;
}

if (self.isCrossDirectMail()) {
if (!self.idCardFrontPic() || self.idCardFrontPic() == "") {
if (self.useLayer()) {
layer.alert("请上传身份证正面照片！");
}
else {
confirmDialog.show("请上传身份证正面照片！", function () {
});
}
return;
}

if (!self.idCardBackPic() || self.idCardBackPic() == "") {
if (self.useLayer()) {
layer.alert("请上传身份证反面照片！");
}
else {
confirmDialog.show("请上传身份证反面照片！", function () {
});
}
return;
}
}
}
if (!self.paymentSelected()) {
if (self.useLayer()) {
layer.alert("请选择支付方式！");
}
else {
confirmDialog.show("请选择支付方式！", function () {
});
}
self.editDeliveryAndPayment();
return;
}

/* e刻达订单不选择原先的配送方式 */
if (!self.deliveryRuleSelected() && !self.isFastDelivery()) {
if (self.useLayer()) {
layer.alert("请选择配送方式！");
}
else {
confirmDialog.show("请选择配送方式！", function () {
});
}
self.editDeliveryAndPayment();
return;
}

if (self.isFastDelivery() || self.isOLE()) {
if (!self.initedWjsPaymentAndDeliveryRule()) {
if (self.isWjsDeliveryPoint()) {
confirmDialog && confirmDialog.show("请选择自提时间");
self.editDeliveryAndPayment();
return;
} else {
confirmDialog && confirmDialog.show("请选择配送时间");
self.editDeliveryAndPayment();
return;
}
}
}

if (!self.deliveryTimeSelected() && !(self.isCrossBorder() || self.isFastDelivery()) && !self.notRequireDeliveryTime && !self.isGift()) {
if (self.useLayer()) {
layer.alert("请选择配送时间！");
}
else {
confirmDialog.show("请选择配送时间！", function () {
});
}
self.editDeliveryAndPayment();
return;
}

if (!self.deliveryPointSelected()) {
if (self.useLayer()) {
layer.alert("请选择自提点！");
}
else {
confirmDialog.show("请选择自提点！", function () {
});
}
self.editDeliveryAndPayment();
return;
}
if (self.editingDeliveryAndPayment()) {
if (self.useLayer()) {
layer.alert("请先保存支付和配送信息！");
}
else {
confirmDialog.show("请先保存支付和配送信息！");
}
return;
}
//如果订单待支付金额小于1元,并且订单的成交金额大于1元
if (Number(self.leftPayAmount()) < AppConfig.leftCashPayAmount && Number(self.finalPayAmount()) >= AppConfig.leftCashPayAmount) {
if (self.useLayer()) {
layer.alert("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整积分或购物券使用金额.");
}
else {
confirmDialog.show("使用现金支付金额必须大于" + AppConfig.leftCashPayAmount + "元！请调整积分或购物券使用金额.", function () {
});
}
return;
}
var cartIds = [];
for (var i = 0; i < self.ocs().length; i++) {
var oc = self.ocs()[i];
cartIds.push(oc.cartId);
}
//移动端
if (AppConfig.platform && AppConfig.platform == "mobile") {
var sourceType = [{id: 'mobile_androidApp', name: '安卓App'},
{id: 'mobile_androidWeb', name: '安卓触屏'},
{id: 'mobile_iosApp', name: '苹果App'},
{id: 'mobile_iosWeb', name: '苹果触屏'}];
var ngUserAgent = navigator.userAgent.toLocaleLowerCase();
if (AppConfig.platform_aom && AppConfig.platform_aom == "app") {
if (ngUserAgent.match(/(Android)/i)) {
self.source = sourceType[0].id;
} else if (ngUserAgent.match(/(iPhone|iPod|ios|iPad)/i)) {
self.source = sourceType[2].id;
}
} else {
if (ngUserAgent.match(/(Android)/i)) {
self.source = sourceType[1].id;
} else if (ngUserAgent.match(/(iPhone|iPod|ios|iPad)/i)) {
self.source = sourceType[3].id;
}
}
}

var postData = {
cartIds: cartIds.join(","),
memo: self.memo(),
buyerId: self.buyerId,
selectedAddressId: self.deliveryAddress && self.deliveryAddress.id(),
certificate: self.certificate(),
idCardFrontPic: self.idCardFrontPic(),
idCardBackPic: self.idCardBackPic(),
selectedPayInterfaceId: self.selectedPayInterfaceId(),
merchantId: AppConfig.merchantId,  // 这各种接口接收的都不一样啊
exm: AppConfig.exMerchantId,
source: self.source || "",
merchantType: AppConfig.merchantType,
saveCertificate: self.saveCertificate(),
selectedOcPayments: JSON.stringify(self.selectedOcPayments()),
isGift: window.isGift,
giftRegionId: window.giftRegionId
};

if (self.isFastDelivery() || self.isOLE()) {
if (self.isWjsDeliveryPoint()) {  //万家送自提订单
postData.fastDeliveryStart = self.chosenWjsTimeRange().value.start;
postData.fastDeliveryEnd = self.chosenWjsTimeRange().value.end;
// 配送方式选择自提，发现订单信息没有isDeliveryPoint = 1,手动加上一个
postData.isDeliveryPoint = 1;
} else {
// 定时达暂时注释
//postData.fastDeliveryStart = self.chosenWjsTimeSlot().value.start;
//postData.fastDeliveryEnd = self.chosenWjsTimeSlot().value.end;
}
}
$.each(self.payRecs(), function (idx, rec) {
postData[rec.payInterfaceId] = rec.money;
});

for (k in self.pluginItems) {
var plugItem = self.pluginItems[k];
if (plugItem.onAddOrder) {
var extraData = plugItem.onAddOrder();
$.extend(postData, extraData);
}
}

if (typeof orderFormExtras != 'undefined') {
$.each(orderFormExtras, function (idx, extra) {
var extraData = extra.onAddOrder(self);
$.extend(postData, extraData);
});
}
var postUrl = AppConfig.url + AppConfig.addOrderUrl;

if (self.isFastDelivery()) {
postUrl = AppConfig.url + AppConfig.sonAddOrderUrl;
}

self.addingOrder(true);
if (!postData.merchantType) {
postData.merchantType = AppConfig.merchantTypeForApp;
}
$.post(postUrl, postData, function (ret) {
self.addingOrder(false);
if (ret.state == 'ok') {
if (AppConfig.platform && AppConfig.platform == "mobile") {
if (parent) {
if (AppConfig.ewjIdentify) {
parent.native.nativeToPay(ret.orderIds);
} else {
parent.window.location.hash = "#/orderResultPage/" + ret.orderIds;
}
}
} else {
var useJiaJuQuanMoney = ret.useJiaJuQuanMoney;
if (useJiaJuQuanMoney) {
//如果有使用家居券支付，直接先跳转到家居券支付页面
window.location.href = AppConfig.jiaJuQuanPayUrl + "?orderIds=" + ret.orderIds + "&useMoney=" + useJiaJuQuanMoney;
} else {
window.location.href = AppConfig.payUrl + "?orderIds=" + ret.orderIds;
}

}
} else {
if (self.useLayer()) {
layer.alert(ret.msg, function () {
if (ret.code && ret.code == 'notLogin') {
window.location.href = AppConfig.loginUrl;
return;
}
});
}
else {
confirmDialog.show(ret.msg, function () {
if (ret.code && ret.code == 'notLogin') {
if (AppConfig.platform && AppConfig.platform == "mobile") {
parent.window.location.href = AppConfig.loginUrl;
} else {
window.location.href = AppConfig.loginUrl;
}
return;
}
});
}

self.addingOrder(false);
if (ret.code && ret.code == 'address') {
self.editConsignee();
}
}
}, "JSON");
};
if (typeof orderFormExtras !== 'undefined') {
$.each(orderFormExtras, function (idx, extra) {
extra.init(self);
});
}
}
;
var elem = document.getElementById("orderFormPage");
if(!elem){
$.get("/buyflowApp/loadOrderFormHtml.jsx",function(html){
$("#buyFlowOrderForm").html(html);
$(document).trigger("koInit");
});
}
else{
$(document).ready(
function(){
$(document).trigger("koInit");
}
);
};
