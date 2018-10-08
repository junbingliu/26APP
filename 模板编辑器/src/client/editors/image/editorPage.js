


function ImageEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.spec = null;
    self.imgSize = ko.observable();
    self.selectedImg=ko.observable();
    self.init=function(){
        self.photoGalleryEditor=window["photoGallery"];
        self.photoGalleryEditor.spec=self.spec;
        self.selectedImg=self.photoGalleryEditor.selectedImg;
    };
    self.init();
    self.closeImageEditor = function(){
        $("#ImageEditor").hide();
    };
    self.saveDataToDB=function(){
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        if(self.selectedImg()){
            if(self.spec=="undefined"||!self.spec){
                self.spec=null;
            }
            self.selectedImg(self.appEditor.getImgSize(self.selectedImg(),self.spec));
        };
        var data={imgUrl:self.selectedImg()};
        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'image';
        param["dataType"] = "json"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            };
            self.appEditor.setPageDataProperty(self.dataId,data);
            self.closeImageEditor();
            self.appEditor.refresh();
        }, "json");
    };
};
