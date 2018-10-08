//#import editorPage.js
(function PageConfig(e, configs) {
    var self = {};
    //console.log("1.pageConfig init...");
    var pageConfigEditor = window["pageConfigEditorModel"];
    if(pageConfigEditor){
        self.pageConfigEditor = pageConfigEditor;
    }
    else{
        self.pageConfigEditor = new PageConfigEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("pageConfigEditor"));
        ko.applyBindings(self.pageConfigEditor,document.getElementById("pageConfigEditor"));
        window["pageConfigEditorModel"] = self.pageConfigEditor;
    };
    console.log("2.pageConfig init...");
    $("#editPageConfig").click(function(){$("#pageConfigEditor").modal("show");});

})($root, $configs);