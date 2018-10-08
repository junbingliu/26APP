/**
 * Created by Administrator on 14-4-6.
 */
function GroupInfoDialog(merchantId) {

    var self = this;
    self.merchantId = merchantId;
    self.name = ko.observable();
    self.description = ko.observable();
    //self.userGroupViewModel = null;
    self.currentGroup = null;

    self.onAddGroupOk = null;
    self.doAddGroup = function () {
        var name = self.name();
        var description = self.description();
        $.post("server/userGroup/addGroup.jsx",{n:name,d:description,m:self.merchantId},function(data){
            if(data.state=='ok'){
                var group = new UserGroup(data.id, name, description,self.merchantId);
                if (self.onAddGroupOk) {
                    self.onAddGroupOk(group);
                }
                $('#dialogGroupInfo').modal("hide");
            }
            else{
                alert("出错了：" + data.msg);
            }
        },"json");
    }

    self.updateGroup = function () {
        var name = self.name();
        var description = self.description();
        $.post("server/userGroup/updateGroup.jsx",{m:self.merchantId,n:name,d:description,g:self.currentGroup.id()},function(data){
            if(data.state=='ok'){
                self.currentGroup.name(name);
                self.currentGroup.description(description);
                $('#dialogGroupInfo').modal("hide");
            }
            else{
                alert(data.msg);
            }
        },"json");
    }

    self.ok = function () {
        $('#dialogGroupInfo .groupName').blur();
        $('#dialogGroupInfo .groupDescription').blur();
        if (self.currentGroup != null) {
            self.updateGroup();
        }
        else {
            self.doAddGroup();
        }
    }

    self.onGroupDialogKeyDown = function (item, event) {
        if (event.which == 13) {
            self.ok();
            return false;
        }
        return true;
    }
}

function AddUserDialog(merchantId) {
    var self = this;
    self.merchantId = merchantId;
    self.loginId = ko.observable();
    self.currentGroup = null;
    self.addUser = function () {
        $('#dialogAddUser .userLoginId').blur();
        var loginId = self.loginId();
        $.post("server/userGroup/addUser2Group.jsx",{m:self.merchantId,g:self.currentGroup.id(),u:loginId},function(data){
            if(data.state=='ok'){
                var u = data.u;
                console.log(u.id);
                var user = new User(u.id, loginId, u.nickName, u.realName);
                self.currentGroup.users.push(user);
                $('#dialogAddUser').modal("hide");
            }
            else{
                alert(data.msg);
            }
        },"json");
    }
    self.onKeyDown = function (data, event) {
        if (event.which == 13) {
            self.addUser();
            return false;
        }
        else {
            return true;
        }
    }
}

