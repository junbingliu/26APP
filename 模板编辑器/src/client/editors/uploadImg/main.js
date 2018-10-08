//#import editorPage.js
(function UploadImg(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var uploadImgEditor = window["uploadImgEditor"];
    if(uploadImgEditor){
        self.editorViewModel = uploadImgEditor;
    }
    else{
        self.editorViewModel = new UploadImgEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("UploadImgEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("UploadImgEditor"));
        window["uploadImgEditor"] = self.editorViewModel;
    };

})($root, $configs);