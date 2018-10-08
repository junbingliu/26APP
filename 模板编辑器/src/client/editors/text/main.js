//#import editor.js
(function Text(e,configs) {
    var self = {};
    var textEditor = window["textEditor"];
    if(textEditor){
        self.editorViewModel = textEditor;
    }
    else{
        self.editorViewModel = new TextEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("TextEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("TextEditor"));
        window["textEditor"] =self.editorViewModel;
    }

    $("[data-type='text']", e).mouseenter(function (evt) {
        var currentElem = $(this);
        var eventList = [{
            event:"click",
            fn:function(evt){
                self.clicking = true;
                var mask = $(evt.currentTarget);

                var dataId = currentElem.attr("data-id");
                var subType = currentElem.attr("dataSubType");
                self.editorViewModel.dataId=dataId;
                self.editorViewModel.sunType = subType;
                mask.hide();
                mask.off("click");

                var source = "";
                var sourceType = currentElem.attr("data-source-type") || "1";
                if(sourceType == "1"){
                    source = currentElem.text().trim();
                }else if(sourceType = "2"){
                    source = configs.pageData[dataId];
                }

                self.editorViewModel.text(source);
                configs.appEditor.modal("TextEditor",true);
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();

    });

})($root, $configs);