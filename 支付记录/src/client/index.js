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
function EditPayRecordPage(){
var self = this;
self.payRecord = ko.observable({});
self.paidMoneyAmount = ko.observable();
self.payState = ko.observable();
self.transactionSn = ko.observable();
self.setPayRecord = function(payRec){
self.payRecord(payRec);
if(payRec.payState=='paid'){
self.paidMoneyAmount(payRec.paidMoneyAmount);
self.transactionSn(payRec.bankSN);
}
else{
self.paidMoneyAmount(payRec.needPayMoneyAmount);
}


self.payState(payRec.payState);
}
self.update = function(){
var postData = {
id : self.payRecord().id,
payState:self.payState(),
paidMoneyAmount:self.paidMoneyAmount(),
transactionSn:self.transactionSn()
}

$.post("server/updateRecord.jsx",postData,function(ret){
if(ret.state=='ok'){
bootbox.alert("修改成功！");
window.location.href="#/list";
}
else{
bootbox.alert("修改失败！" + ret.msg);
}
},"JSON");
}

self.toList = function(){
window.location.href="#/list";
}
}
var editPayRecordPage = null;
$(document).ready(function(){
editPayRecordPage = new EditPayRecordPage();
ko.applyBindings(editPayRecordPage,document.getElementById("editPayRecordPage"));
});
function RealPayRec(data){
data = data || {};
var self = this;
self.merchantId = data.merchantId;
self.orderIds = data.orderIds;
self.orderAliasCodes = data.orderAliasCodes;
self.needPayMoneyAmount = data.needPayMoneyAmount;
self.payRecordIds = data.payRecordIds;
self.createTime = data.createTime;
self.createTimeString = ko.computed(function(){
if(self.createTime){
var d = new Date(self.createTime);
return d.toString("yyyy-MM-dd HH:mm:ss");
}
else{
return "";
}
});
self.lastModifyTime = data.lastModifyTime;
self.lastModifyTimeString = ko.computed(function(){
if(self.createTime){
var d = new Date(self.lastModifyTime);
return d.toString("yyyy-MM-dd HH:mm:ss");
}
else{
return "";
}
});
self.payState = data.payState;
self.payStateString = ko.computed(function(){
if(self.payState=="uncertain"){
return "支付中"
}
else if(self.payState=='paid'){
return "已支付";
}
else if(self.payState=='failed'){
return "支付失败"
}
});
self.paidTime = data.paidTime;
self.paidTimeString = ko.computed(function(){
if(self.paidTime){
var d = new Date(self.paidTime);
return d.toString("yyyy-MM-dd HH:mm:ss");
}
else{
return "";
}
});
self.payInterfaceId = data.payInterfaceId;
self.integralPoints = data.integralPoints;
self.integralMoneyRatio = data.integralMoneyRatio;
self.paymentName = data.paymentName;
self.paymentId = data.paymentId;
self.bankSN = data.bankSN;
self.outerId = data.outerId;
self.id = data.id;
self.paidMoneyAmount = data.paidMoneyAmount;
}

function RealPayRecListPage(data){
var self = this;
self.list = ko.observableArray();
self.pager = new Pager();
self.pager.displayNumber(10);
self.pager.pageSize(50);
self.payments = ko.observableArray();
self.currentPayInterfaceId = ko.observable();

self.paidOnly = ko.observable(false);
self.dateString = ko.observable("20150125");

self.getPayments = function(){
$.post("server/getPayments.jsx",{},function(ret){
self.payments(ret.payments);
},"JSON");
}

self.goPayment = function(payment){
self.currentPayInterfaceId(payment.objectMap.payInterfaceId);
self.getList(0,self.pager.pageSize());
}

self.goAll = function(){
self.currentPayInterfaceId(null);
self.getList(0,self.pager.pageSize());
}
self.getList = function(start,limit){
var postData = {
m:m,
start:start,
limit:limit,
payInterfaceId:self.currentPayInterfaceId(),
paidOnly:self.paidOnly,
dateString:self.dateString
};
$.post("server/getList.jsx",postData,function(ret){
if(ret.state == 'ok'){
self.list($.map(ret.list,function(rec){
return new RealPayRec(rec);
}));
self.pager.total(ret.total);
self.pager.setStart(start);
}
},"json");
}

self.refresh = function(){
self.getList(self.pager.currentPage()*self.pager.pageSize(),self.pager.pageSize());
}
self.pager.callback = self.getList;
self.edit = function(payRec){
editPayRecordPage.setPayRecord(payRec);
window.location.href="#/edit"
}
}
var realPayRecListPage = null;
$(document).ready(function(){
realPayRecListPage = new RealPayRecListPage();
realPayRecListPage.getList(0,realPayRecListPage.pager.pageSize());
realPayRecListPage.getPayments();
ko.applyBindings(realPayRecListPage,document.getElementById("realPayRecListPage"));
});

var sammyApp = $.sammy(function() {
this.get("#/list", function (context) {
$(".page").hide();
$("#realPayRecListPage").show();
realPayRecListPage.refresh();
});

this.get("#/edit", function (context) {
$(".page").hide();
$("#editPayRecordPage").show();
});
});

$(document).ready(function(){
bootbox.setDefaults({locale:"zh_CN"});
sammyApp.run("#/list");

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
