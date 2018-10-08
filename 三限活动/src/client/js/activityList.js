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

