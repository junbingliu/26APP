//#import editorPage.js
(function GroupOnList(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var groupOnListEditor = window["groupOnListEditor"];
    if(groupOnListEditor){
        self.editorViewModel = groupOnListEditor;
    }
    else{
        self.editorViewModel = new GroupOnListEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("GroupOnListEditorModel"));
        ko.applyBindings(self.editorViewModel,document.getElementById("GroupOnListEditorModel"));
        window["groupOnListEditor"] = self.editorViewModel;
    }
    var mask = $("#mask", e);
    self.clicking = false;
    $("[data-type='groupOnList']", e).mouseenter(function () {

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
                        return new GroupOnItem(itemData);
                    });
                    self.editorViewModel.products(items);
                }else{
                    self.editorViewModel.products([]);
                }
            }
            configs.appEditor.modal("GroupOnListEditor","true");
            $("#GroupOnListEditor").draggable({ handle: ".modal-header" });
            $("#GroupOnSelect").draggable({ handle: ".modal-header" });
            mask.off("click");
        });
    });
    mask.mouseleave(function () {
        mask.hide();
        mask.off("click");
    });

})($root, $configs);