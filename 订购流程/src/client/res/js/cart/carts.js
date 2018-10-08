/**
* Created by Administrator on 14-1-24.
*/
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



