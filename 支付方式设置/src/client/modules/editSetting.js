function EditSettingPage(){
    var self = this;
    self.id = ko.observable();
    self.name = ko.observable();
    self.inheritPlatform = ko.observable(true);

    self.setMerchant = function(merchant){
        self.id(merchant.id);
        self.name(merchant.name);
        if(merchant.inheritPlatform){
            self.inheritPlatform("Y");
        }
        else{
            self.inheritPlatform("N");
        }

    }

    self.saveSetting = function(){
        var postData = {
            m:"head_merchant",
            theMerchantId:self.id(),
            inheritPlatform:self.inheritPlatform()
        };
        $.post("server/saveSetting.jsx",postData,function(ret){
            if(ret.state=='ok'){
                bootbox.alert("保存成功！",function(){window.location.href="#/merchantList"});
            }
        },"JSON");
    }
}

var editSettingPage = null;
$(document).ready(function(){
    editSettingPage = new EditSettingPage();
    ko.applyBindings(editSettingPage,document.getElementById("editSettingPage"));
});
