function User(id, loginId, nickname, realname) {
    var self = this;
    self.id = ko.observable(id);
    self.loginId = ko.observable(loginId);
    self.nickname = ko.observable(nickname);
    self.realname = ko.observable(realname);
    self.displayName = ko.computed(function(){
        if(self.realname()){
            return self.realname();
        }
        if(self.nickname()){
            return self.nickname();
        }
        if(self.loginId()){
            return self.loginId();
        }
    });

}
function UserGroup(id, name, description,merchantId) {
    var self = this;
    self.name = ko.observable(name);
    self.description = ko.observable(description);
    self.id = ko.observable(id);
    self.users = ko.observableArray();
    self.merchantId = merchantId;
    self.show=ko.observable(true);
    self.remove = function (user) {
        $.post("server/userGroup/removeUser.jsx",{m:self.merchantId,u:user.id,g:self.id},function(data){
            if(data.state=='ok'){
                self.users.remove(user);
            }
            else{
                alert(data.msg);
            }
        },"json");
    }
}