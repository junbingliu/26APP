//#import editor.js
(function HtmlSource(e,configs) {
    var self = {};
    var sourceEditor = window["sourceEditor"];
    if(sourceEditor){
        self.editorViewModel = sourceEditor;
    }
    else{
        self.editorViewModel = new SourceEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("SourceEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("SourceEditor"));
        window["sourceEditor"] =self.editorViewModel;
    }

    $("[data-type='htmlSource']", e).mouseenter(function (evt) {

        var currentElem = $(this);
        var eventList = [{
            event:"click",
            fn:function(evt){
                self.clicking = true;
                var mask = $(evt.currentTarget);
                mask.hide();
                var source = currentElem.html();
                var dataId = currentElem.attr("data-id");
                var subType = currentElem.attr("dataSubType");
                self.editorViewModel.dataId=dataId;
                self.editorViewModel.sunType = subType;
                self.editorViewModel.source(source);
                configs.appEditor.modal("SourceEditor",true);
                mask.off("click");
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();


    });


})($root, $configs);