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
function ActivityForm(){
var self = this;
self.id = ko.observable();
self.code = ko.observable();
self.beginTime = ko.observable();
self.endTime = ko.observable();
self.numberPerUser = ko.observable();
self.name = ko.observable();
self.numberPerActivity = ko.observable();
self.setData = function(data){
self.id(data.id);
self.code(data.code);
var dtBeginTime = new Date();
dtBeginTime.setTime(data.beginTime);
self.beginTime(dtBeginTime);
var dtEndTime = new Date();
dtEndTime.setTime(data.endTime);
self.endTime(dtEndTime);
self.numberPerUser(data.numberPerUser);
self.numberPerActivity(data.numberPerActivity);
self.name(data.name);
}
self.save = function(){
var postData = {
id : self.id(),
name: self.name(),
code: self.code(),
beginTime:self.beginTime() instanceof Date ? self.beginTime().getTime(): self.beginTime(),
endTime:self.endTime() instanceof Date ? self.endTime().getTime(): self.endTime(),
numberPerUser : self.numberPerUser(),
numberPerActivity : self.numberPerActivity(),
productId:productId,
m:m
}
$.post("../server/saveActivity.jsx",postData,function(ret){
if(ret.state == 'ok'){
bootbox.alert("保存成功。");
window.location.href="#/list";
}
},"JSON");
}
}

var activityForm = null;
$(document).ready(function(){
activityForm = new ActivityForm();
ko.applyBindings(activityForm,document.getElementById("activityFormPage"));
});
/**
* Created by Administrator on 2015-05-09.
*/
function ActiveListPage(){
var self = this;
self.activityList = ko.observableArray();
self.productId = "";
self.pager = new Pager();
self.pager.pageSize(50);
self.goToPage = function(pageNo){
self.getList((pageNo-1)*self.pager.pageSize(),self.pager.pageSize());
}
self.getList = function(start,limit){
$.post("../server/getActivityList.jsx",{m:m,productId:self.productId,start:start,limit:limit},function(ret){
if(ret.state=='ok'){
self.pager.total(ret.total);
var theList = $.map(ret.activities,function(activity){
activity.numberPerActivity = activity.numberPerActivity||-1;
try{
var beginDate = new Date();
beginDate.setTime(Number(activity.beginTime));
activity.beginDateString = beginDate.getFullYear() + "-" + (beginDate.getMonth()+1) + "-" + beginDate.getDate();
}
catch(e){
activity.beginDateString = activity.beginTime;
}
try{
var endDate = new Date();
endDate.setTime(activity.endTime);
activity.endDateString = endDate.getFullYear() + "-" + (endDate.getMonth()+1) + "-" + endDate.getDate();

}
catch(e){
activity.endDateString = activity.endTime;
}
return activity;
});
self.activityList(theList);
self.pager.setStart(start);
}
else{
bootbox.alert("网络错误！");
}
},"json");
}

self.pager.callback = self.getList;
self.edit = function(activity){
activityForm.setData(activity);
window.location.href="#/activityForm";
}
self.viewLog = function(activity){
window.location.href="#/viewlog/"+activity.id;
}
self.add = function(){
activityForm.setData({});
window.location.href="#/activityForm";
}
}

var activityListPage = null;
$(document).ready(function(){
activityListPage = new ActiveListPage();
ko.applyBindings(activityListPage,document.getElementById("activityListPage"));
activityListPage.productId = window.productId;
activityListPage.getList(0,50);
});

function BuyLogsPage() {
var self = this;
self.logs = ko.observableArray();
self.activityId = "";
self.pager = new Pager();
self.pager.pageSize(10);
self.goToPage = function(pageNo){
self.getList((pageNo-1)*self.pager.pageSize(),self.pager.pageSize());
};
self.getList = function(start,limit){
if(!self.activityId){
return;
}
$.post("../server/getActivityLogs.jsx",{m:m,activityId:self.activityId,start:start,limit:limit},function(ret){
if(ret.state=='ok'){
self.pager.total(ret.total);

self.logs(ret.logs.map(function(log){
var d = new Date();
d.setTime(log.time);
//log.timeString = d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate();
log.timeString = d.Format("yyyy-MM-dd hh:mm:ss");
return log;
}));
self.pager.setStart(start);
}
else{
bootbox.alert("网络错误！" + ret.msg);
}
},"json");
};
self.pager.callback = self.getList;
}

var buylogsPage = null;
$(document).ready(function(){
buylogsPage = new BuyLogsPage();
ko.applyBindings(buylogsPage,document.getElementById("buyLogsPage"));
buylogsPage.goToPage(1);
});

Date.prototype.Format = function (fmt) { //author: meizz
var o = {
"M+": this.getMonth() + 1, //月份
"d+": this.getDate(), //日
"h+": this.getHours(), //小时
"m+": this.getMinutes(), //分
"s+": this.getSeconds(), //秒
"q+": Math.floor((this.getMonth() + 3) / 3), //季度
"S": this.getMilliseconds() //毫秒
};
if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
for (var k in o)
if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
return fmt;
};
var sammyApp = $.sammy(function() {
this.get("#/list", function (context) {
$(".page").hide();
$(".navItem").removeClass("active");
$("#navList").addClass("active");
window.scrollTo(0, 0);
activityListPage.goToPage(1);
$("#activityListPage").fadeIn(200);
});
this.get("#/activityForm", function (context) {
$(".page").hide();
$(".navItem").removeClass("active");
$("#navList").addClass("active");
window.scrollTo(0, 0);
$("#activityFormPage").fadeIn(200);
});
this.get("#/viewlog/:activityId",function(context){
$(".page").hide();
buylogsPage.activityId = this.params['activityId'];
buylogsPage.goToPage(1);
$("#buyLogsPage").fadeIn(200);
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
color: '#3f3', // #rgb or #rrggbb or array of colors
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
console.log("spiner initialized.")
});


