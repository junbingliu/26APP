
function TextLinkEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.content = ko.observable("");
    self.linkTo = ko.observable("");
    self.openInNewPage = ko.observable("_blank");

    self.init=function(){
        self.content("");
        self.linkTo("");
        self.openInNewPage("_blank");
    };
    self.init();
    self.closeTextLinkEditor = function(){
        $("#TextLinkEditor").hide();
    };

    self.saveDataToDB=function(){
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        var data = {content:self.content(),linkTo:self.linkTo(),openInNewPage:self.openInNewPage()};
        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'textLink';
        param["dataType"] = "json"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            };
            self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
            self.closeTextLinkEditor();
            self.appEditor.refresh();
        }, "json");
    };
};
