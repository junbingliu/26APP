function RealPayRecUpdatePage(configs) {
    var self = this;
    self.id = ko.observable(configs.id || "");
    self.paidMoneyAmount = ko.observable(configs.paidMoneyAmount || "");
    self.needPayMoneyAmount = ko.observable(configs.needPayMoneyAmount || "");
    self.bankSN = ko.observable(configs.bankSN || "");
    self.payState = ko.observable(configs.payState || "");

    self.setData = function (data) {
        data = data || {};
        self.id(data.id || "");
        self.paidMoneyAmount(data.paidMoneyAmount || "");
        self.needPayMoneyAmount(data.needPayMoneyAmount || "");
        self.bankSN(data.bankSN || "");
        self.payState(data.payState || "");
    };
    self.getData = function () {
        var data = {};
        data.id = self.id();
        data.paidMoneyAmount = self.paidMoneyAmount();
        data.needPayMoneyAmount = self.needPayMoneyAmount();
        data.bankSN = self.bankSN();
        data.payState = self.payState();
        return data;
    };
    self.save = function () {
        var postData = ko.mapping.toJS(self.getData());
        if(!postData.id || postData.id == ""){
            bootbox.alert("ID不能为空");
            return;
        }
        if(!postData.payState || postData.payState == ""){
            bootbox.alert("支付状态不能为空");
            return;
        }
        if(!postData.paidMoneyAmount || postData.paidMoneyAmount == "" || isNaN(postData.paidMoneyAmount)){
            bootbox.alert("支付金额错误");
            return;
        }
        if(Number(postData.paidMoneyAmount) > Number(postData.needPayMoneyAmount)){
            bootbox.alert("已支付金额不能大于支付金额");
            return;
        }
        if(!postData.bankSN || postData.bankSN == ""){
            bootbox.alert("流水号不能为空");
            return;
        }
        postData.paidMoneyAmount = (Number(postData.paidMoneyAmount) * 100).toFixed(2);
        postData.transactionSn = postData.bankSN;
        $.post("../server/updateRecord.jsx", postData, function (ret) {
            if (ret.state == 'ok') {
                bootbox.alert("保存成功。");
            } else {
                bootbox.alert("保存失败！" + ret.msg);
            }
        }, "JSON");
    };
    self.close = function () {
        var index = parent.layer.getFrameIndex(window.name);
        parent.layer.close(index);
    };
}