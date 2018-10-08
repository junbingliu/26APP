function AssignByRolesPage(merchantId) {
    var self = this;
    self.merchantId = merchantId;
    self.roles = ko.observableArray([]);
    self.currentPage = ko.observable("byRolePage-list");
    self.editing = ko.observable(false);
    self.currentRole = ko.observable();
    self.userGroups=ko.mapping.fromJS([]);
    self.searchKeyWord = ko.observable();
    self.beginEdit = function () {
        self.editing(true);
    }
    self.endEdit = function () {
        self.editing(false);
    }
    function Role(id, name, description,merchantId,userGroups){
        var self = this;
        self.name = ko.observable(name);
        self.description = ko.observable(description);
        self.id = ko.observable(id);
        self.userGroups = ko.mapping.fromJS(userGroups);
        self.merchantId = merchantId;
        self.show=ko.observable(true);
        self.remove = function (userGroup) {
            var userGroupId=userGroup.id();
            $.post("server/roleAssign/removeRolesFromMemberGroup.jsx",{m:self.merchantId,g:userGroupId,roleId:self.id()},function(data){
                if(data.state=='ok'){
                    self.userGroups.remove(userGroup);
                }
            },"json");
        }
    }
    self.getRoles = function () {
        $.post("server/roleAssign/getRolesHasUserGroups.jsx", {m: self.merchantId}, function (data) {
            if (data.state == 'ok') {
                var roles = [];
                for(var i=0; i<data.roles.length;i++){
                    var  r = data.roles[i];
                    var role = new Role(r.id, r.name, r.description,self.merchantId, r.userGroups);
                    roles.push(role);
                }
                self.roles(roles);
            }
        }, "json");
    }
    self.getUserGroups = function () {
        $.post("server/roleAssign/getSelectedUserGroups.jsx", {m: self.merchantId}, function (data) {
            if (data.state == 'ok') {
                ko.mapping.fromJS(data.groups, self.userGroups);
            }
        }, "json");
    }

    self.selectUserGroups = function (role) {
        self.currentRole = role;
        $.map(self.userGroups(), function (userGroup) {
            userGroup.selected(false);
        });
        $("#SelectUserGroupsDialog").modal("show");
    }
    self.add = function () {
        var selectedUserGroups = [];
        var userGroupIds = [];
        for (var i = 0; i < self.userGroups().length; i++) {
            var userGroup = self.userGroups()[i];
            if (userGroup.selected()) {
                selectedUserGroups.push(userGroup);
                userGroupIds.push(userGroup.id());
            }
        }
        $.post("server/roleAssign/addUserGroupsToRoles.jsx",{m:self.merchantId,userGroupIds:userGroupIds.join(","),R:self.currentRole.id()},function(data){
            if(data.state=='ok'){
                self.currentRole.userGroups(selectedUserGroups);
                $("#SelectUserGroupsDialog").modal("hide");
            }
        },"json");
    }
    self.search=function(){
        for(var i=0;i<self.roles().length;i++){
            var name=self.roles()[i].name()
            var searchKeyWord= self.searchKeyWord()
            var id=self.roles()[i].id()
            if(!searchKeyWord){
                self.roles()[i].show(true);
            }else{
                if((name&&name.indexOf(searchKeyWord)>-1)||id.indexOf(searchKeyWord)>-1){
                    self.roles()[i].show(true);
                }else{
                    self.roles()[i].show(false);
                }
            }

        }

    }

}