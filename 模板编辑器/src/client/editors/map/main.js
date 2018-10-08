//#import editorPage.js
(function Map(e, configs) {
    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var mapEditor = window["mapEditor"];
    if(mapEditor){
        self.editorViewModel = mapEditor;
    }
    else{
        self.editorViewModel = new MapEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("MapEditor"));
        ko.applyBindings(self.editorViewModel,document.getElementById("MapEditor"));
        window["mapEditor"] = self.editorViewModel;
    };
    self.clicking = false;
    $("[data-type='map']", e).each(function (index,domEle) {
        var signElem =  $("#fancyCategories_sign > div").clone();
        var mask = $("#mask", e).clone();
        signElem.appendTo($(domEle)).mouseenter(function (){
            var height = $(domEle).height();
            var width =  $(domEle).width();
            mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
            mask.show();
            mask.off("click");
        }).mouseleave(function(){
                mask.remove();
            }).click(function(){
                self.clicking = true;
                mask.hide();
                var dataId = $(domEle).attr("dataId")||$(domEle).attr("data-id");
                self.editorViewModel.dataId=dataId;
                configs.appEditor.setCurrentPage("MapEditor");
            });
    });

})($root, $configs);