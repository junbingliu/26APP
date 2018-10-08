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
