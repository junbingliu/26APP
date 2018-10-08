//#import ActivityForm.js
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


