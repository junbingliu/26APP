
function ImgLinkListEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.spec = null;
    self.attrs=ko.observable();
    self.imgSize = ko.observable();
    self.selectedImgList=ko.observableArray([]);
    self.showTime=ko.observable(true);
    self.isMakeRecordId = false;
    self.init=function(){
        self.photoGalleryEditor=window["photoGallery"];
        self.selectedImgList=self.photoGalleryEditor.selectedImgList;
    };
    self.init();

    self.closeImgLinkListEditor = function(){
        $("#ImgLinkListEditor").hide();
    };
    self.delete = function (item) {
        self.selectedImgList.remove(item);
    }
    self.up=function(item){
        var index=self.selectedImgList.indexOf(item);
        if(index==0){return};
        var array=self.selectedImgList();
        var temp=array[index-1];
        array[index-1]=array[index];
        array[index]=temp;
        self.selectedImgList(array);
    };
    self.down=function(item){
        var index=self.selectedImgList.indexOf(item);
        if(index==self.selectedImgList().length-1){return};
        var array=self.selectedImgList();
        var temp=array[index+1];
        array[index+1]=array[index];
        array[index]=temp;
        self.selectedImgList(array);
    };
    self.saveDataToDB=function(){
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        if(self.selectedImgList()&&self.selectedImgList().length>0){
            for(var i=0;i<self.selectedImgList().length;i++){
                var item=self.selectedImgList()[i];
                if(self.spec=="undefined"||!self.spec){
                    self.spec=null;
                }
                item.imgUrl(self.appEditor.getImgSize(item.imgUrl(),self.spec));
            };
        };


        if(self.isMakeRecordId){
            function randomNum(){
                var num = "";
                for(var r=0;r<6;r++){
                    num += Math.floor(Math.random() * 10);
                }
                return num + "";
            }
            var list = self.selectedImgList();
            if(list.length > 0){
                list.forEach(function(item){
                    var id = item.recordId;
                    if(!id){
                        item.recordId = randomNum();
                    }
                });
            }
        }

        var data = ko.mapping.toJS(self.selectedImgList);
        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'imgLinkList';
        param["dataType"] = "jsonArray"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            };
            self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
            self.closeImgLinkListEditor();
            self.appEditor.refresh();
        }, "json");
    };
};
