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