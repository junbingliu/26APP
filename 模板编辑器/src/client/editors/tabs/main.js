//#import editor.js
(function Tabs(e, configs) {
    var self = {};
    var tabsEditor = window["tabsEditor"];
    if (tabsEditor) {
        self.editorViewModel = tabsEditor;
    }
    else {
        self.editorViewModel = new TabsEditor(configs.appId, configs.pageId, configs.m, configs.pageData, configs.appEditor);
        ko.cleanNode(document.getElementById("TabsEditor"));
        ko.applyBindings(self.editorViewModel, document.getElementById("TabsEditor"));
        window["tabsEditor"] = self.editorViewModel;
    }

    $("[data-type='tabs']", e).each(function (index, domEle) {
        var signElem = $("#fancyCategories_sign > div").clone();
        var dataPosition = $(domEle).attr("data-position");
        if(dataPosition=="relative"){
            $(domEle).css("position", "relative");
        }
        var mask = $("#mask", e).clone();
        var source = $(domEle).html();
        var dataId = $(domEle).attr("data-id");
        $("[tab-target]", $(domEle)).mouseenter(function () {
            $("[tab-target]", $(domEle)).removeClass("cur");
            $(this).addClass("cur");
            /*将tab-target对应的内容隐藏*/
            var target = $(this).attr("tab-target");
            $("[tab-target]", $(domEle)).each(function (i, ele) {
                var t = $(ele).attr("tab-target");
                $("#" + t, e).hide();
            });
            /*然后再显示出来*/
            $("#" + target, e).show();
        });
        /*只显示cur Tab对应的内容*/
        $("[tab-target]", $(domEle)).each(function (i, ele) {
            var t = $(ele).attr("tab-target");
            var isCur = $(ele).hasClass("cur");
            if (!isCur) {
                $("#" + t, e).hide();
            }
            else {
                $("#" + t, e).show();
            }

        });
        signElem.appendTo($(domEle)).mouseenter(function () {
            var height = $(domEle).height();
            var width = $(domEle).width();
            mask.css({left: 0, top: 0, width: width, height: height}).appendTo($(domEle));
            mask.show();
            mask.off("click");
        }).mouseleave(function () {
                mask.remove();
        }).click(function () {
            self.editorViewModel.dataId = dataId;
            var subType = $(domEle).attr("dataSubType");
            self.editorViewModel.sunType = subType;
            mask.remove();
            self.editorViewModel.sourceCode(source);
            configs.appEditor.modal("TabsEditor", true);
        });

    });
})($root, $configs);