
function DateTimeEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.startDate = ko.observable("");
    self.endDate = ko.observable("");

    self.init=function(){
        self.startDate("");
        self.endDate("");
    };
    self.init();
    self.closeDateTimeEditor = function(){
        $("#DateTimeEditor").hide();
    };

    self.saveDataToDB=function(){
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        var data = {startDate:self.startDate(),endDate:self.endDate()};

        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'dateTime';
        param["dataType"] = "json"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            };
            self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
            self.closeDateTimeEditor();
            self.appEditor.refresh();
        }, "json");
    };
};
