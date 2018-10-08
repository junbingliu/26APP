//#import editorPage.js
(function PhotoGallery(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var photoGallery = window["photoGallery"];
    if(photoGallery){
        self.editorViewModel = photoGallery;
    }
    else{
        self.editorViewModel = new PhotoGalleryEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("PhotoGallery"));
        ko.applyBindings(self.editorViewModel,document.getElementById("PhotoGallery"));
        window["photoGallery"] = self.editorViewModel;
    };
    $("#PhotoGallery").draggable({ handle: ".modal-header" });

})($root, $configs);