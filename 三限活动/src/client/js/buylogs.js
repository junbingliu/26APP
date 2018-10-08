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