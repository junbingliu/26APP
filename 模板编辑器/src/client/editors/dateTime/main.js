//#import editorPage.js
(function DateTime(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var dateTimeEditor = window["dateTimeEditor"];
    if(dateTimeEditor){
        self.editorViewModel = dateTimeEditor;
    }
    else{
        self.editorViewModel = new DateTimeEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("DateTimeEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("DateTimeEditor"));
        window["dateTimeEditor"] = self.editorViewModel;
    };
    var mask = $("#mask", e);

    self.clicking = false;
    $("[data-type='dateTime']", e).mouseenter(function () {
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
            var data=configs.appEditor.getPageDataProperty(dataId);
            if(data){
                self.editorViewModel.startDate(data.startDate);
                self.editorViewModel.endDate(data.endDate);
            }else{
                self.editorViewModel.init();
            }
            self.editorViewModel.dataId = dataId;
            $("#DateTimeEditor").show();
            $("#DateTimeEditor").draggable({ handle: ".modal-header" });

            mask.off("click");
        });
    });
    mask.mouseleave(function () {
        mask.hide();
        mask.off("click");
    });

})($root, $configs);