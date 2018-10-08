function ViewModel (){
    var self = this;
    self.onKey = function(data,event){
        if(event.which == 13){
            //'enter' was pressed
            self.login();
            return false;
        }
        return true;
    }
    self.userName = ko.observable();
    self.password = ko.observable();
    self.validateCode = ko.observable();
    self.login = function(){
        var postData = {userName:self.userName(),password:self.password(),validateCode:self.validateCode()}
        $.post('server/loginHandler.jsx',postData,function(data){
            if(data.state === 'ok'){
                window.location.href = 'shell.jsx?m=' + data.merchantId;
            }
            else{
                alert(data.msg);
            }
        },'json');
    }
}
$(document).ready(function(){
    ko.applyBindings(new ViewModel());
});