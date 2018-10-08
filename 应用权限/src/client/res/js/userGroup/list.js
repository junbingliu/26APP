/**
 * Created by Administrator on 14-4-6.
 */
function UserGroupListViewModel(merchantId) {
    var self = this;
    self.merchantId = merchantId;
    self.groupCount = 1;
    self.userGroups = ko.observableArray([]);
    self.searchKeyWord = ko.observable();

    self.groupInfoDialog = new GroupInfoDialog(merchantId);
    self.userDialog = new AddUserDialog(merchantId);

    ko.applyBindings(self.groupInfoDialog,document.getElementById("dialogGroupInfo"));
    ko.applyBindings(self.userDialog,document.getElementById("dialogAddUser"));

    self.editing = ko.observable(false);
    self.beginEdit = function(){
        self.editing(true);
    },
    self.endEdit = function(){
        self.editing(false);
    },

    self.loadUserGroups = function(){
        $.post("server/userGroup/listGroups.jsx",{m:self.merchantId},function(data){
            if(data.state=='ok'){
                var g = data.groups;
                var groups = [];
                for(var i=0; i<data.groups.length;i++){
                    var  g = data.groups[i];
                    var userGroup = new UserGroup(g.id, g.name, g.description,self.merchantId);
                    groups.push(userGroup);
                    for(var j=0; j< g.users.length; j++){
                        var u = g.users[j];
                        var user = new User(u.id, u.loginId, u.nickName, u.realName);
                        userGroup.users.push(user);
                    }
                }
                self.userGroups(groups);
            }
        },"json");
    }

    self.addGroupDialog = function () {
        self.groupInfoDialog.name("");
        self.groupInfoDialog.description("");
        self.groupInfoDialog.currentGroup = null;
        self.groupInfoDialog.merchantId = self.merchantId;
        self.groupInfoDialog.onAddGroupOk = function(userGroup){
            self.userGroups.push(userGroup);
        };
        $('#dialogGroupInfo').modal({show: true});
    }

    self.updateGroupDialog = function (userGroup) {
        self.groupInfoDialog.name(userGroup.name());
        self.groupInfoDialog.description(userGroup.description());
        self.groupInfoDialog.userGroupViewModel = self;
        self.groupInfoDialog.merchantId = self.merchantId;
        self.groupInfoDialog.currentGroup = userGroup;
        $('#dialogGroupInfo').modal({show: true});
    }

    self.addUserDialog = function (userGroup) {
        self.userDialog.currentGroup = userGroup;
        self.userDialog.merchantId = self.merchantId;
        $('#dialogAddUser').modal("show");
    }
    self.deleteGroup = function(userGroup){
        $.post("server/userGroup/deleteGroup.jsx",{m:self.merchantId,g:userGroup.id},function(data){
            if(data.state=='ok'){
                self.userGroups.remove(userGroup);
            }
            else{
                alert(data.msg);
            }
        },"json");
    }
    self.search=function(){
        for(var i=0;i<self.userGroups().length;i++){
            //用户组名字
            var name=self.userGroups()[i].name()
            var searchKeyWord= self.searchKeyWord()
            if(!searchKeyWord){
                self.userGroups()[i].show(true);
            }else{
                if((name&&name.indexOf(searchKeyWord)>-1)){
                    self.userGroups()[i].show(true);
                }else{
                    self.userGroups()[i].show(false);
                }
            }
        }

    }
}

var userGroupList = null;
$(document).ready(function(){
    userGroupList = new UserGroupListViewModel(merchantId);
    ko.applyBindings(userGroupList,document.getElementById("userGroupList"));
});
