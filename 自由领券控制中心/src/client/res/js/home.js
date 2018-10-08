function ActivityForm() {
var self = this;
self.id = ko.observable();
self.name = ko.observable(); //活动名称
self.isEnable = ko.observable(); //是否生效
self.beginTime = ko.observable(); //活动开始时间
self.endTime = ko.observable(); //活动结束时间
self.batchIds = ko.observable(); //可领的券批次
self.count = ko.observable(1); //一次可领券数量
self.amount = ko.observable(1); //可领券总数量
self.reason = ko.observable(); //领券原因
self.desc = ko.observable(); //活动备注

self.init = function (activity) {
if (activity) {
self.id(activity.id); //活动名称
self.name(activity.name); //活动名称
self.isEnable(activity.isEnable); //是否生效
self.batchIds(activity.batchIds || ""); //可领的券批次
self.count(activity.count || "1"); //一次可领券数量
self.amount(activity.amount || "1"); //可领券总数量
self.reason(activity.reason || ""); //领券原因
self.desc(activity.desc || ""); //活动备注
self.beginTime(activity.beginTime); //活动开始时间
self.endTime(activity.endTime); //活动结束时间
} else {
self.id("");
self.name(""); //活动名称
self.isEnable("true"); //是否生效
self.batchIds(""); //可领的券批次
self.count(1); //一次可领券数量
self.amount(1); //可领券总数量
self.reason(""); //领券原因
self.desc(""); //活动备注
self.beginTime(""); //活动开始时间
self.endTime(""); //活动结束时间
}
};

self.back = function () {
$(".page").hide();
$("#list").show();
};

self.checkForm = function () {
if (!self.name()) {
alert("活动名称不能为空");
return false;
} else if (!self.beginTime()) {
alert("活动开始时间不能为空");
return false
} else if (!self.endTime()) {
alert("活动结束时间不能为空");
return false
} else if (!self.batchIds()) {
alert("可领的券批次不能为空");
return false
} else if (!self.count()) {
alert("每次领券数量不能为空");
return false
} else if (!self.amount()) {
alert("最多领券数量不能为空");
return false
} else if (!self.reason()) {
alert("领券原因不能为空");
return false
}
return true;
};

self.save = function () {
var check = self.checkForm();
if (!check) {
return;
}

var postData = {};
postData.merchantId = merchantId;
postData.id = self.id();
postData.name = self.name();
postData.isEnable = self.isEnable();
postData.reason = self.reason();
postData.desc = self.desc();
postData.batchIds = self.batchIds();
postData.count = self.count();
postData.amount = self.amount();
postData.beginTime = new Date(self.beginTime());
postData.endTime = new Date(self.endTime());

$.post("../pages/addActivity.jsx", postData, function (data) {
if (data.state == "ok") {
self.back();
activityList.getActivityList(merchantId);
} else {
alert(data.msg);
}
}, "json");
}

}

var activityForm = null;
$(document).ready(function () {
activityForm = new ActivityForm();
ko.applyBindings(activityForm, document.getElementById("activityForm"));
});

function ActivityList() {
var self = this;
self.activityList = ko.observableArray([]);
self.getActivityList = function (merchantId) {
$.post("../pages/getActivityList.jsx", {merchantId: merchantId}, function (data) {
if (data.state == "ok") {
ko.mapping.fromJS(data.activityList, {}, self.activityList);
}
}, "json")
};
self.addActivity = function () {
$(".page").hide();
$("#activityForm").show();
activityForm.init();
};
self.updateActivity = function (item) {
$(".page").hide();
$("#activityForm").show();
activityForm.init(ko.mapping.toJS(item));
};
self.deleteActivity = function (item) {
if(!confirm("删除后将不可恢复，确定要删除吗")){
return;
}

$.post("../pages/deleteActivity.jsx", {merchantId: merchantId, id: item.id()}, function (data) {
if (data.state == "ok") {
self.getActivityList(merchantId);
} else {
alert(data.msg);
}
}, "json")
};
}



var activityList = null;
var merchantId;
$(document).ready(function () {
merchantId = $("#merchantId").val();
$('.form_datetime').datetimepicker({
format: 'yyyy/mm/dd hh:ii:ss',
language: 'zh-CN',
weekStart: 1,
todayBtn: 1,
autoclose: 1,
todayHighlight: 1,
startView: 2,
forceParse: 0,
showMeridian: 1,
minuteStep: 1
});

activityList = new ActivityList();
activityList.getActivityList(merchantId);
ko.applyBindings(activityList, document.getElementById("list"));
});

