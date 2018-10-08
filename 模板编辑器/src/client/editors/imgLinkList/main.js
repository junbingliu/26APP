//#import editorPage.js
(function ImgLinkList(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var imgLinkListEditor = window["imgLinkListEditor"];
    if(imgLinkListEditor){
        self.editorViewModel = imgLinkListEditor;
    }
    else{
        self.editorViewModel = new ImgLinkListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("ImgLinkListEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("ImgLinkListEditor"));
        window["imgLinkListEditor"] = self.editorViewModel;
    };

    self.clicking = false;
    $("[data-type='imgLinkList']", e).mouseenter(function (evt) {
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
                var showTime = currentElem.attr("showTime");
                var imgSize = currentElem.attr("imgSize");
                var data=configs.appEditor.getPageDataProperty(dataId);
                var begienDate=new Date().getTime();
                if(imgSize){
                    self.editorViewModel.imgSize(imgSize);
                }else{
                    self.editorViewModel.imgSize("");
                }

                if(data){
                    var items = $.map(data, function (itemData) {
                        var item=new ImgItem(itemData);
                        return item;
                    });
                    self.editorViewModel.selectedImgList(items);
                }else{
                    self.editorViewModel.selectedImgList([]);
                }
                var endDate=new Date().getTime();
                console.log("耗时:"+(endDate-begienDate));
                self.editorViewModel.dataId = dataId;
                self.editorViewModel.spec=spec;
                if(!showTime||showTime=="false"){
                    self.editorViewModel.showTime(false);
                }else{
                    self.editorViewModel.showTime(true);
                }
                var isMakeId = currentElem.attr("data-make-id");
                if(isMakeId && isMakeId == "true"){
                    self.editorViewModel.isMakeRecordId = true;
                }
                $("#ImgLinkListEditor").show();
                $("#ImgLinkListEditor").draggable({ handle: ".modal-header" });
                mask.off("click");
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();
    });


})($root, $configs);