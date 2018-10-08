
function RightsTemplateFormViewModel(){
    var self = this;
    self.template = new RightsTemplate();
    self.availableApps = ko.observableArray();

    self.getAvailableApps = function(){
        $.post("server/rightsTemplate/getAvailableApps.jsx",{m:m},function(data){
            if(data.state=='ok'){
                self.availableApps($.map(data.apps,function(app){
                    return new App(app.name,app.description,app.icon,app.appId);
                }));
            }
        },"json");
    }

    self.leftApps = ko.computed(function(){
        var leftApps = [];
        var contained = self.template.apps();
        var allApps = self.availableApps();
        $.each(allApps,function(index,app){
            var found = false;
            for(var i=contained.length-1; i>=0;i--){
                if(contained[i].appId() == app.appId()){
                    found = true;
                    console.log(app.appId());
                    break;
                }
            }
            if(!found){
                leftApps.push(app);
            }
        });
        return leftApps;
    });

    self.addApp = function(app){
      self.template.apps.push(app);
    };

    self.deleteApp = function(app){
        self.template.apps.remove(app);
    }


    self.setTemplateId = function(templateId){
        if(templateId){
            $.post("server/rightsTemplate/getTemplate.jsx",{m:m,id:templateId},function(data){
                if(data.state=='ok'){
                    self.template.setData(data.template);
                }
                else{
                    bootbox.alert("出错了：" + data.msg);
                }
            },"json");
        }
        else{
           self.template.setData({});
        }
    }
    self.save = function(){
        var templateData = ko.mapping.toJS(self.template);
        $.post("server/rightsTemplate/saveTemplate.jsx",{m:m,template:JSON.stringify(templateData)},function(data){
            if(data.state=='ok'){
                self.template.id(data.id);
                bootbox.alert("保存成功。");
            }
           else{
                bootbox.alert("保存失败。");
            }
        },"json");
    }
    self.getAvailableApps();
}

var rightsTemplateFormPage= null;
$(document).ready(function(){
    rightsTemplateFormPage = new RightsTemplateFormViewModel();
    ko.applyBindings(rightsTemplateFormPage,document.getElementById("rightsTemplateForm"));

});



