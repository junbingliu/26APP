
function RightsTemplateListViewModel(){
   var self = this;
   this.templates =  ko.observableArray();
   this.getAllTemplates = function(){
       $.post("server/rightsTemplate/getAllTemplates.jsx",{m:m},function(data){
           if(data.state=='ok'){
               var templates = $.map(data.templates,function(template){
                   var templateObj = new RightsTemplate(template);
                   return templateObj;
               });
               self.templates(templates);
           }
       },"json");
   }
   this.getAllTemplates();
   this.deleteTemplate = function(template){
       $.post("server/rightsTemplate/deleteTemplate.jsx",{m:m,id:template.id()},function(data){
           if(data.state=='ok'){
               bootbox.alert("删除成功。");
               self.getAllTemplates();
           }
           else{
               bootbox.alert("删除失败！");
           }
       },"json");
   };
};
var rightsTemplateListPage = null;
$(document).ready(function(){
    rightsTemplateListPage = new RightsTemplateListViewModel();
    ko.applyBindings(rightsTemplateListPage,document.getElementById("rightsTemplateListPage"));

});
