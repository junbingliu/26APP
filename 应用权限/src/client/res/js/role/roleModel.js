


var RoleModel =  function(merchantId){
    var self = this;
    self.currentPage = ko.observable();
    self.merchantId = merchantId;
    self.rolesPage = new RolesPage(merchantId,self);
    self.roleForm = new RoleFormPage(merchantId,self);
    self.add = function(){
        self.roleForm.mode("add");
        self.roleForm.roleId(null);
        self.currentPage('form');
        self.roleForm.merchantId = self.merchantId;
        self.roleForm.getApps();
    }
    self.edit = function(role){
        self.roleForm.setRole(role);
        self.currentPage('form');
    }

}

