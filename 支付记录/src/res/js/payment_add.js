function PaymentAddPage(data) {
    var self = this;
    self.id = ko.observable(data.id || "");
    self.name = ko.observable(data.name || "");

    self.setData = function (data) {
        data = data || {};
        self.id(data.id || "");
        self.name(data.name || "");
    };
    self.getData = function () {
        var data = {};
        data.id = self.id();
        data.name = self.name();
        return data;
    };
    self.save = function () {
        var postData = ko.mapping.toJS(self.getData());

        $.post("handler/add_payment_handler.jsx", {m: m, appStr: JSON.stringify(postData)}, function (ret) {
            if (ret.state == 'ok') {
                bootbox.alert("保存成功。", function () {
                    window.location.reload();
                });
                self.setData();
            }
            else {
                bootbox.alert("保存失败！" + ret.msg);
            }
        }, "JSON");
    };
    self.reset = function () {
        self.setData({});
    };
}
var paymentAddPage = null;
$(document).ready(function () {
    var data = {};
    paymentAddPage = new PaymentAddPage(data);
    ko.applyBindings(paymentAddPage, document.getElementById("paymentAddPage"));

    $(".deleteClass").on("click",function(){
        var id = $(this).data("a");
        $.post("handler/payment_delete_handler.jsx",{id:id},function(ret){
            if(ret.state == "ok"){
                bootbox.alert("删除成功",function(){
                    window.location.reload();
                });
            }else{
                bootbox.alert(ret.msg);
            }
        },"JSON");
    });
});