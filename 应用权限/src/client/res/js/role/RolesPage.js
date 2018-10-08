var RolesPage = function(merchantId,roleModel){
    var self = this;
    self.merchantId = merchantId;
    self.importedRoles = ko.mapping.fromJS([]);
    self.privateRoles = ko.mapping.fromJS([]);
    self.searchKeyWord = ko.observable();

    self.getRoles = function(){
        $.post("server/roles/getRoles.jsx",{m:self.merchantId},function(data){
            if(data.state=='ok'){
                self.privateRoles.removeAll();
                ko.mapping.fromJS(data.privateRoles,self.privateRoles);
//                ko.mapping.fromJS(data.importedRoles,self.importedRoles);
            }
        },"json");
    }
    self.delete = function(role){
        $.post("server/roles/deleteRole.jsx",{m:self.merchantId,roleId:role.id},function(data){
            if(data.state=='ok') {
                self.privateRoles.remove(role);
            }
        },"json")
    }
    self.search=function(){
        for(var i=0;i<self.privateRoles().length;i++){
            var name=self.privateRoles()[i].name()
            var id=self.privateRoles()[i].id()
            var description=self.privateRoles()[i].description()
            var searchKeyWord= self.searchKeyWord()
            if(!searchKeyWord){
                self.privateRoles()[i].show(true);
            }else{
                if((name&&name.indexOf(searchKeyWord)>-1)||id.indexOf(searchKeyWord)>-1||(description&&description.indexOf(searchKeyWord)>-1)){
                    self.privateRoles()[i].show(true);
                }else{
                    self.privateRoles()[i].show(false);
                }
            }
        }
    }
    self.edit = function(role){
       roleFormPage.merchantId = self.merchantId;
       roleFormPage.setRole(role);
       window.location.href = "#/" + self.merchantId + "/role/edit";

    }
    self.remove = function(role){
        bootbox.confirm("确定要删除吗?", function(result) {
            if(result){
                self.delete(role);
            }
        });

    }
    self.add = function(){
        window.location.href = "#/" + self.merchantId + "/role/add";
    }
}
var rolesPage = null;
$(document).ready(function(){
    rolesPage = new RolesPage(merchantId);
    ko.applyBindings(rolesPage,document.getElementById("listRoles"));
});