//#import editorPage.js
(function PanicBuyList(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var panicBuyListEditor = window["panicBuyListEditor"];
    if(panicBuyListEditor){
        self.editorViewModel = panicBuyListEditor;
    }
    else{
        self.editorViewModel = new PanicBuyListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("PanicBuyListEditorModel"));
        ko.applyBindings(self.editorViewModel,document.getElementById("PanicBuyListEditorModel"));
        window["panicBuyListEditor"] = self.editorViewModel;
    }
    var mask = $("#mask", e);
    self.clicking = false;
    $("[data-type='panicBuyList']", e).mouseenter(function () {

        if(self.clicking){
            self.clicking = false;
            return;
        }
        var offset = $(this).offset();
        var height = $(this).attr("data-height");
        if (!height) {
            height = $(this).height();
        }
        var width =  $(this).attr("data-width");
        if(!width){
            width = $(this).width();
        }

        var currentElem = $(this);

        mask.css({left: offset.left, top: offset.top, width: width, height: height});
        mask.show();
        mask.off("click");
        mask.click(function(e){
            self.clicking = true;
            mask.hide();
            var dataId = currentElem.attr("data-id");
            var spec = currentElem.attr("data-spec");
            self.editorViewModel.dataId = dataId;
            self.editorViewModel.spec = spec;
            if(configs.pageData){
                var data=configs.appEditor.getPageDataProperty(dataId);
                if(data){
                    var items = $.map(data, function (itemData) {
                        return new PanicBuyItem(itemData);
                    });
                    self.editorViewModel.products(items);
                }
                else{
                    self.editorViewModel.products([]);
                }
            }
            configs.appEditor.modal("PanicBuyListEditor","true");
            $("#PanicBuyListEditor").draggable({ handle: ".modal-header" });
            $("#PanicBuySelect").draggable({ handle: ".modal-header" });
            mask.off("click");
        });
    });
    mask.mouseleave(function () {
        mask.hide();
        mask.off("click");
    });

})($root, $configs);