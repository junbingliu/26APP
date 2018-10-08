//#import editorPage.js
(function Image(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var imageEditor = window["imageEditor"];
    if(imageEditor){
        self.editorViewModel = imageEditor;
    }
    else{
        self.editorViewModel = new ImageEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("ImageEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("ImageEditor"));
        window["imageEditor"] = self.editorViewModel;
    };

    self.clicking = false;
    $("[data-type='image']", e).mouseenter(function (evt) {
        if(self.clicking){
            self.clicking = false;
            return;
        }
        var currentElem = $(this);
        var eventList = [{
            event:"click",
            fn:function(evt){
                self.clicking = true;
                var targetObj = $(evt.currentTarget);
                targetObj.hide();
                var dataId = currentElem.attr("data-id");
                var spec = currentElem.attr("data-spec");
                var imgSize = currentElem.attr("imgSize");
                if(imgSize){
                    self.editorViewModel.imgSize(imgSize);
                }else{
                    self.editorViewModel.imgSize("");
                }
                var data=configs.appEditor.getPageDataProperty(dataId);
                if(data){
                    self.editorViewModel.selectedImg(data.imgUrl);
                }else{
                    self.editorViewModel.selectedImg("");
                }
                self.editorViewModel.dataId = dataId;
                self.editorViewModel.spec=spec;
                $("#ImageEditor").show();
                $("#ImageEditor").draggable({ handle: ".modal-header" });
                targetObj.off("click");
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();
    });


})($root, $configs);