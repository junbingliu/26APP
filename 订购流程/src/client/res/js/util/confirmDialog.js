function ConfirmDialog(){
    var self = this;
    self.message = ko.observable();
    self.okButtonCaption = ko.observable("确定");
    self.cancelButtonCaption = ko.observable("取消");
    self.callback = ko.observable();
    self.showOKbtn = ko.observable(true);
    self.showCancelbtn = ko.observable(true);

    self.ok = function(){
        $("#maskLayer").hide();
        $("#confirmDialog").fadeOut(300);
        if(self.callback){
            self.callback();
        }
    };

    self.cancel = function(){
        $("#maskLayer").hide();
        $("#confirmDialog").fadeOut(300);
    };
    self.show = function(message,callback,okButtonCaption, cancelButtonCaption,buttons){
        self.callback = callback;
        if(okButtonCaption){
            self.okButtonCaption(okButtonCaption);
        }else{
            self.okButtonCaption("确定");
        }
        if(cancelButtonCaption){
            self.cancelButtonCaption(cancelButtonCaption);
        }else{
            self.cancelButtonCaption("取消");
        }
        self.message(message);
        $("#maskLayer").show();
        $("#confirmDialog").fadeIn(300);
        //如果有传进来要显示哪些按钮，那就用传进来的配置显示,例:['ok','cancel']
        if(buttons){
            self.showOKbtn(false);
            self.showCancelbtn(false);
            for(var i = 0 ;i<buttons.length;i++){
                if(buttons[i] == "ok"){
                    self.showOKbtn(true);
                }
                if(buttons[i] == "cancel"){
                    self.showCancelbtn(true);
                }
            }
        }else {
            self.showOKbtn(true);
            self.showCancelbtn(true);
        }
    };
}

var confirmDialog=null;
$(document).on("koInit",function(event,extraParams){
    var root = document.getElementById("confirmDialog");
    confirmDialog = new ConfirmDialog();
    if(root){
        ko.applyBindings(confirmDialog,root);
    }
});