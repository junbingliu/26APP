//#import editorPage.js
(function TextLink(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var textLinkEditor = window["textLinkEditor"];
    if(textLinkEditor){
        self.editorViewModel = textLinkEditor;
    }
    else{
        self.editorViewModel = new TextLinkEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("TextLinkEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("TextLinkEditor"));
        window["textLinkEditor"] = self.editorViewModel;
    };

    self.clicking = false;
    $("[data-type='textLink']", e).mouseenter(function (evt) {
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
                var data=configs.appEditor.getPageDataProperty(dataId);
                if(data){
                    self.editorViewModel.linkTo(data.linkTo);
                    self.editorViewModel.content(data.content);
                    self.editorViewModel.openInNewPage(data.openInNewPage||"_blank");
                }else{
                    self.editorViewModel.init();
                }
                self.editorViewModel.dataId = dataId;
                $("#TextLinkEditor").show();
                $("#TextLinkEditor").draggable({ handle: ".modal-header" });
                mask.off("click");
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();
    });


})($root, $configs);