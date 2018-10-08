function SourceEditor(appId,pageId,merchantId,pageData,appEditor){
    var self = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.source = ko.observable();
    self.subType = null;

    self.returnMainFrame = function(){
        self.appEditor.setCurrentPage("mainFrame");

    };
    self.save = function(){
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        param["dataId"] = self.dataId;
        param["dataValue"] = self.source();
        param['type'] = 'htmlSource';
        param["dataType"] = "string"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            }
            else {
                bootbox.alert("数据保存成功！");
                self.appEditor.setPageDataProperty(self.dataId, self.source());
                self.appEditor.updateView();
                self.returnMainFrame();
            };
        }, "json");
    };
} ;