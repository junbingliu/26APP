function Pager(){
var self = this;
self.total = ko.observable();
self.pageSize = ko.observable(50);
self.currentPage = ko.observable();
self.callback = null;
self.displayNumber = ko.observable(10);
self.totalPages = ko.computed(function(){
return Math.ceil(self.total() / self.pageSize());
});
self.pages = ko.computed(function(){
var ret = [];
var totalPages = self.totalPages();
console.log("totalPages = " + totalPages + "\n")
if(self.currentPage()>0) {
ret.push({
pageName: "上一页",
pageIdx: self.currentPage() - 1,
isCurrent:false
});
}


var fromPage = self.currentPage() -  self.displayNumber()/2;
if(fromPage<0){
fromPage = 0;
}

var lastPage = fromPage + self.displayNumber();
if(lastPage > totalPages){
lastPage = totalPages;
}

for(var i=fromPage;i<lastPage;i++){
var isCurrent = (i==self.currentPage());
ret.push({
pageName:"" + (i+1),
pageIdx:i,
isCurrent:isCurrent
});
}

if(self.currentPage()<self.totalPages()-1){
ret.push({
pageName:"下一页",
pageIdx:self.currentPage()+1,
isCurrent:false
});
}

console.log(ret);
return ret;
});
self.setStart = function(start){
var curPage = start / self.pageSize();
self.currentPage(curPage);
}
self.onPage =function(page){
if(self.callback){
var start = page.pageIdx * self.pageSize();
var limit = self.pageSize();
self.callback(start,limit);
}
}
}
function Merchant(data){
var self = this;
self.id = data.id;
self.name = data.name;
self.inheritPlatform = data.inheritPlatform;
}

function MerchantListPage(data){
var self = this;
self.merchantList = ko.observableArray();
self.keyword = ko.observable("");
self.pager = new Pager();
self.pager.displayNumber(10);
self.pager.pageSize(20);
self.getMerchants = function(start,limit,keyword){
if(!keyword){
keyword = self.keyword;
}
var postData = {
keyword:keyword,
start:start,
limit:limit
};
$.post("server/getMerchants.jsx",postData,function(ret){
if(ret.state == 'ok'){
self.merchantList($.map(ret.merchants,function(mer){
return new Merchant(mer);
}));
self.pager.total(ret.total);
self.pager.setStart(start);
}
},"json");
}

self.refresh = function(){
self.getMerchants(0,self.pager.pageSize(), self.keyword);
};
self.pager.callback = self.getMerchants;
self.edit = function(merchant){
editSettingPage.setMerchant(merchant);
window.location.href="#/editSetting"
};
self.editPayments = function(merchant){
if(merchant.inheritPlatform){
window.open("/OurHome/modules/payment/PaymentList.jsp?merchantId=head_merchant&columnId=col_m_payment","_blank");
}
else{
window.open("/OurHome/modules/payment/PaymentList.jsp?merchantId="+ merchant.id + "&columnId=col_m_payment","_blank");
}
}
}
var merchantListPage = null;
$(document).ready(function(){
merchantListPage = new MerchantListPage();
merchantListPage.getMerchants(0,merchantListPage.pager.pageSize());
ko.applyBindings(merchantListPage,document.getElementById("merchantListPage"));
});
function EditSettingPage(){
var self = this;
self.id = ko.observable();
self.name = ko.observable();
self.inheritPlatform = ko.observable(true);

self.setMerchant = function(merchant){
self.id(merchant.id);
self.name(merchant.name);
if(merchant.inheritPlatform){
self.inheritPlatform("Y");
}
else{
self.inheritPlatform("N");
}

}

self.saveSetting = function(){
var postData = {
m:"head_merchant",
theMerchantId:self.id(),
inheritPlatform:self.inheritPlatform()
};
$.post("server/saveSetting.jsx",postData,function(ret){
if(ret.state=='ok'){
bootbox.alert("保存成功！",function(){window.location.href="#/merchantList"});
}
},"JSON");
}
}

var editSettingPage = null;
$(document).ready(function(){
editSettingPage = new EditSettingPage();
ko.applyBindings(editSettingPage,document.getElementById("editSettingPage"));
});
function IntegralSettingsPage(){
var self  = this;
self.integralMoneyRatio = ko.observable();
self.supportNegativeIntegral = ko.observable();

self.getData = function(){
$.post("server/getIntegralSettings.jsx",{m:m},function(ret){
self.integralMoneyRatio(ret.integralMoneyRatio);
self.supportNegativeIntegral("" + ret.supportNegativeIntegral);
},"JSON");
}
self.save = function(){
var postData = {
m:m,
integralMoneyRatio:self.integralMoneyRatio(),
supportNegativeIntegral:self.supportNegativeIntegral
}
$.post("server/setIntegralSettings.jsx",postData,function(ret){
if(ret.state == 'ok'){
bootbox.alert("保存成功！");
}
else{
bootbox.alert("保存失败！" + ret.msg);
}
},"JSON");
}
}

var integralSettingsPage = null;
$(document).ready(function(){
integralSettingsPage = new IntegralSettingsPage();
integralSettingsPage.getData();
ko.applyBindings(integralSettingsPage,document.getElementById("integralSettingsPage"));
});


var sammyApp = $.sammy(function() {
this.get("#/merchantList", function (context) {
$(".page").hide();
$("#merchantListPage").show();
merchantListPage.refresh();
});
this.get("#/merchantListShow", function (context) {
$(".page").hide();
$("#merchantListPage").show();
//merchantListPage.refresh();
});

this.get("#/editSetting", function (context) {
$(".page").hide();
$("#editSettingPage").show();
});

this.get("#/integralSettings", function (context) {
$(".page").hide();
$("#integralSettingsPage").show();
});
});

$(document).ready(function(){
bootbox.setDefaults({locale:"zh_CN"});
sammyApp.run("#/merchantListShow");

var opts = {
lines: 12, // The number of lines to draw
length: 7, // The length of each line
width: 5, // The line thickness
radius: 10, // The radius of the inner circle
corners: 1, // Corner roundness (0..1)
rotate: 0, // The rotation offset
direction: 1, // 1: clockwise, -1: counterclockwise
color: '#000', // #rgb or #rrggbb or array of colors
speed: 1, // Rounds per second
trail: 100, // Afterglow percentage
shadow: true, // Whether to render a shadow
hwaccel: false, // Whether to use hardware acceleration
className: 'spinner', // The CSS class to assign to the spinner
zIndex: 2e9, // The z-index (defaults to 2000000000)
top: '50%', // Top position relative to parent
left: '50%' // Left position relative to parent
};
var target = document.getElementById('spinholder');
var spinner = new Spinner(opts);

$(document).ajaxStart(function () {
spinner.spin(target);
});
$(document).ajaxComplete(function () {
spinner.stop();
});
});
