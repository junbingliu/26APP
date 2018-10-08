function IntegralSettingsPage(){
    var self  = this;
    self.integralMoneyRatio = ko.observable();
    self.supportNegativeIntegral = ko.observable();

    self.getData = function(){
        $.post("server/getIntegralSettings.jsx",{m:m},function(ret){
            self.integralMoneyRatio(ret.integralMoneyRatio);
            self.supportNegativeIntegral("" + ret.supportNegativeIntegral);
        },"JSON");
    }
    self.save = function(){
        var postData = {
            m:m,
            integralMoneyRatio:self.integralMoneyRatio(),
            supportNegativeIntegral:self.supportNegativeIntegral
        }
        $.post("server/setIntegralSettings.jsx",postData,function(ret){
            if(ret.state == 'ok'){
                bootbox.alert("保存成功！");
            }
            else{
                bootbox.alert("保存失败！" + ret.msg);
            }
        },"JSON");
    }
}

var integralSettingsPage = null;
$(document).ready(function(){
    integralSettingsPage = new IntegralSettingsPage();
    integralSettingsPage.getData();
    ko.applyBindings(integralSettingsPage,document.getElementById("integralSettingsPage"));
});

