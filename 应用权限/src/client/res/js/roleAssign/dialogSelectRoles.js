/**
 * Created by Administrator on 14-4-8.
 */
function DialogSelectRoles(){
    var self = this;
    self.merchantId = null;
    self.roles = ko.mapping.fromJS([]);
    self.selectedRoles = ko.observableArray();
    self.onOk = null;
    self.getRoles = function () {
        $.post("server/roleAssign/getRoles.jsx", {m: self.merchantId}, function (data) {
            if (data.state == 'ok') {
                ko.mapping.fromJS(data.roles, self.roles);
            }
        }, "json");
    };
    self.showDialog = function(){
        $.map(self.roles(), function (role) {
            role.selected(false);
        });
        $("#SelectRolesDialog").modal("show");
    };
    self.ok = function(){
        if(self.onOk){
            self.onOk(self.roles());
        }
        $("#SelectRolesDialog").modal("hide");
    }
}
var dialogSelectRoles = null;
$(document).ready(function(){
    dialogSelectRoles = new DialogSelectRoles();
    dialogSelectRoles.getRoles();
    ko.applyBindings(dialogSelectRoles,document.getElementById("SelectRolesDialog"));
});