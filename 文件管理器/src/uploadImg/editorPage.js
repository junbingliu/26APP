
function UploadImgEditor(merchantId){
    var self  = this;
    self.merchantId = merchantId;
    self.currColumn=null;
    self.iframeUrl=ko.observable();
    self.dataId = null;

    self.closeUploadImgEditor = function(){
        self.photoGalleryEditor.getPageData(1);
        $("#UploadImgEditor").hide();

    };
    self.showUploadImgEditor = function(){
        self.photoGalleryEditor=window["photoGallery"];
        self.currColumn=self.photoGalleryEditor.currColumn;
        var host = window.location.host
        self.iframeUrl("http://"+host+"/OurHome/modules/filemanager/ImageUploadForm.jsp?imgColumnId="+self.currColumn+"&columnId=col_image&merchantId="+self.merchantId+"");
        $("#UploadImgEditor").show();
        $("#UploadImgEditor").draggable();
    };
};
