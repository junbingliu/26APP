function AssignByMemberGroupPage(merchantId) {
    var self = this;
    self.merchantId = merchantId;
    self.memberGroups = ko.observableArray([]);
    self.currentPage = ko.observable("byMemberGroups-list");
    self.roles = ko.mapping.fromJS([]);
    self.selectedRoles = ko.observableArray();
    self.currentMemberGroup = null;
    self.searchKeyWord = ko.observable();
    self.editing = ko.observable(false);

    function UserGroup(id, name, description,merchantId,roles) {
        var self = this;
        self.name = ko.observable(name);
        self.description = ko.observable(description);
        self.id = ko.observable(id);
        self.roles = ko.mapping.fromJS(roles);
        self.merchantId = merchantId;
        self.show=ko.observable(true);
        self.remove = function (role) {
            var roleId=role.id();
            $.post("server/roleAssign/removeRolesFromMemberGroup.jsx",{m:self.merchantId,g:self.id(),roleId:roleId},function(data){
                if(data.state=='ok'){
                     self.roles.remove(role);
                }
            },"json");
        }
    }
    self.beginEdit = function(){
        self.editing(true);
    },
    self.endEdit = function(){
        self.editing(false);
    },
    self.getMemberGroups = function () {
        $.post("server/roleAssign/getUserGroups.jsx", {m: self.merchantId}, function (data) {
            if (data.state == 'ok') {
                var groups = [];
                for(var i=0; i<data.groups.length;i++){
                    var  g = data.groups[i];
                    var userGroup = new UserGroup(g.id, g.name, g.description,self.merchantId, g.roles);
                    groups.push(userGroup);
                }
                self.memberGroups(groups);
            }

        }, "json");
    },
    self.getRoles = function () {
        $.post("server/roleAssign/getRoles.jsx", {m: self.merchantId}, function (data) {
            if (data.state == 'ok') {
                ko.mapping.fromJS(data.roles, self.roles);
            }
        }, "json");
    }
    self.selectRoles = function (memberGroup) {
        self.currentMemberGroup = memberGroup;
        dialogSelectRoles.onOk = function(roles){
            self.add(roles);
        };
        dialogSelectRoles.merchantId = self.merchantId;
        dialogSelectRoles.getRoles();
        dialogSelectRoles.showDialog();

    }
    self.add = function (roles) {
        var selectedRoles = [];
        var roleIds = [];
        for (var i = 0; i < roles.length; i++) {
            var role = roles[i];
            if (role.selected()) {
                selectedRoles.push(role);
                roleIds.push(role.id());
            }
        }
        $.post("server/roleAssign/addRolesToMemberGroup.jsx",{m:self.merchantId,g:self.currentMemberGroup.id(),roleIds:roleIds.join(",")},function(data){
            if(data.state=='ok'){
                self.currentMemberGroup.roles(selectedRoles);
                $("#selectRolesDialog").modal("hide");
            }
        },"json");
    }
    self.search=function(){
        for(var i=0;i<self.memberGroups().length;i++){
            var name=self.memberGroups()[i].name()
            var id=self.memberGroups()[i].id()
            var searchKeyWord= self.searchKeyWord()
            if(!searchKeyWord){
                self.memberGroups()[i].show(true);
            }else{
                if((name&&name.indexOf(searchKeyWord)>-1)||id.indexOf(searchKeyWord)>-1){
                    self.memberGroups()[i].show(true);
                }else{
                    self.memberGroups()[i].show(false);
                }
            }

        }

    }
}

var assignByMemberGroupPage = null;
$(document).ready(function(){
    assignByMemberGroupPage = new AssignByMemberGroupPage(merchantId);
    ko.applyBindings(assignByMemberGroupPage,document.getElementById("assignByUserGroupPage"));
});