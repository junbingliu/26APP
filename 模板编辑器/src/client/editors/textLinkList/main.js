//#import editorPage.js
(function TextLinkList(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var textLinkListEditor = window["textLinkListEditor"];
    if(textLinkListEditor){
        self.editorViewModel = textLinkListEditor;
    }
    else{
        self.editorViewModel = new TextLinkListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("TextLinkListEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("TextLinkListEditor"));
        window["textLinkListEditor"] = self.editorViewModel;
    };

    self.clicking = false;
    $("[data-type='textLinkList']", e).mouseenter(function (evt) {
        if(self.clicking){
            self.clicking = false;
            return;
        }

        var currentElem = $(this);
        configs.appEditor.maskMake(currentElem,e,[{event:"click",fn:function(evt){
            self.clicking = true;
            var mask = $(evt.currentTarget);
            mask.hide();
            var dataId = currentElem.attr("data-id");
            var data=configs.appEditor.getPageDataProperty(dataId);
            if(data){
                var items = $.map(data, function (itemData) {
                    return new TextItem(itemData);
                });
                self.editorViewModel.textLinkList(items);
            }else{
                self.editorViewModel.init();
            }
            self.editorViewModel.dataId = dataId;
            var isMakeId = currentElem.attr("data-make-id");
            if(isMakeId && isMakeId == "true"){
                self.editorViewModel.isMakeRecordId = true;
            }
            $("#TextLinkListEditor").show();
            $("#TextLinkListEditor").draggable({ handle: ".modal-header" });
            mask.off("click");
        }}]);
        evt.stopPropagation();
    });

})($root, $configs);