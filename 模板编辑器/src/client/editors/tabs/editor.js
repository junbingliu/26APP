function TabsEditor(appId,pageId,merchantId,pageData,appEditor){
    var self = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.sourceCode = ko.observable();
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
        param["dataValue"] = self.sourceCode();
        param['type'] = 'Tabs';
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
                //从服务器上重新加载数据，因为可能数据发生了变化
                self.appEditor.setPageDataProperty(self.dataId, self.sourceCode());
                self.appEditor.updateView();
                self.returnMainFrame();
            };
        }, "json");
    };
} ;