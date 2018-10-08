//#import editorPage.js
(function ImgLink(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var imgLinkEditor = window["imgLinkEditor"];
    if(imgLinkEditor){
        self.editorViewModel = imgLinkEditor;
    }
    else{
        self.editorViewModel = new ImgLinkEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("ImgLinkEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("ImgLinkEditor"));
        window["imgLinkEditor"] = self.editorViewModel;
    };
    var mask = $("#mask", e);

    self.clicking = false;
    $("[data-type='imgLink']", e).mouseenter(function (evt) {
        if(self.clicking){
            self.clicking = false;
            return;
        }
        var currentElem = $(this);
        var eventList = [{
            event:"click",
            fn:function(evt){
                self.clicking = true;
                var mask = $(evt.currentTarget);
                mask.hide();
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
                    self.editorViewModel.linkTo(data.imgLinkTo);
                    self.editorViewModel.selectedImg(data.imgUrl);
                    self.editorViewModel.description(data.description);
//                self.editorViewModel.startDate(data.startDate);
//                self.editorViewModel.endDate(data.endDate);
                }else{
                    self.editorViewModel.linkTo("");
                    self.editorViewModel.selectedImg("");
                    self.editorViewModel.description("");
//                self.editorViewModel.startDate("");
//                self.editorViewModel.startDate("");
//                self.editorViewModel.endDate("");
                }
                self.editorViewModel.dataId = dataId;
                self.editorViewModel.spec=spec;
                $("#ImgLinkEditor").show();
                $("#ImgLinkEditor").draggable({ handle: ".modal-header" });
                mask.off("click");
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();
    });

})($root, $configs);