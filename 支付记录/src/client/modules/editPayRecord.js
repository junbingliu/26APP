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