function ImgItem(param) {
    this.id = ko.observable(param.id);
    this.fileId = ko.observable(param.fileId);
    this.imgUrl = ko.observable(param.showImageUrl||param.imgUrl);
    this.selected = ko.observable(false);
    this.linkTo = ko.observable(param.linkTo||"");
    this.description=ko.observable(param.description||"");
    if (param.name && param.name.length > 12) {
        param.name = param.name.substring(0, 12);
    }
    this.name = ko.observable(param.fileName);
    this.openInNewPage=ko.observable(param.openInNewPage||"_blank");
    this.startDate=ko.observable(param.startDate);
    this.endDate=ko.observable(param.endDate);
};
function PhotoGalleryEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.searchKeyWord=ko.observable();
    self.selectedItem=null; /**单选状态下用于记录前一次选中图片**/
    self.selectedImg=ko.observable(); /**当前操作选中的图片--单选状态下用到**/
    self.selectedItems=ko.observableArray([]);/**当前操作选中的图片,作临时存储--多选状态下用到**/
    self.selectedImgList=ko.observableArray([]);/**当前操作选中的图片--多选状态下用到**/
    self.isSearch=false;
    self.currColumn=null;
    self.displayLoading=ko.observable(false);
    self.imgList=ko.observableArray([]);
    self.pageSize=24;/**每页显示的条数**/
    self.currPage=ko.observable(1);/**当前页码**/
    self.pageCount=ko.observable();/**总页数**/
    self.multiSelect=ko.observable(false);/**用于开启多选功能**/
    self.init=function(){
        self.uploadImgEditor=window["uploadImgEditor"];
    };
    self.init();
    self.openSelectImgView = function(multiSelect){
        self.multiSelect(multiSelect);
        for(var i=0;i<self.selectedItems().length;i++){
            self.selectedItems()[i].selected(false);
        };
        self.selectedItems.removeAll();/**清空选择内容**/
        if(self.selectedItem){
            self.selectedItem.selected(false);
            self.selectedItem=null;/**清空选择内容**/
        }

        $("#PhotoGallery").show();
    };
    self.selectAll=function(){
        var flag=false;
        if(self.selectedItems().length==self.imgList().length){
               flag=true;
        }
        for(var i=0;i<self.imgList().length;i++){
            var item=self.imgList()[i];
            if(flag){
                item.selected(false);
                self.selectedItems.removeAll();
                console.log(self.selectedItems().length);
            }else{
                item.selected(true);
                self.selectedItems.push(item);
            }

        }
    };
    self.getImgList=function(param){
        $.ajax({
            type: "POST",
            url: "/OurHome/modules/filemanager/ImageSortList.jsp",
            dataType:"JSON",
            data: param,
            beforeSend:function(){
                self.displayLoading(true);
            },
            success: function(data){
                self.displayLoading(false);
                var items = $.map(data.records, function (itemData) {
                    return new ImgItem(itemData);
                });
                self.imgList(items);
                var length=Math.ceil(data.total/self.pageSize);
                self.pageCount(length);
            },
            complete:function(){
                self.displayLoading(false);
            }
        });
    };
    self.getPageData=function(pageNum){
        var start=(pageNum-1)*self.pageSize;
        self.currPage(pageNum);
        var param={limit:self.pageSize,imgColId:self.currColumn,merchantId:self.merchantId,isSearch:self.isSearch,start:start,keyword:self.searchKeyWord()};
        self.getImgList(param);
    };
    self.nextPage=function(){
        if(self.currPage()==self.pageCount()){
            return;
        }
        self.getPageData(Number(self.currPage())+1)
    };
    self.toPage=function(){
        if(self.currPage()<1){
            self.currPage(1);
        }else if(self.currPage()>self.pageCount()){
            self.currPage(self.pageCount());
        };
        self.getPageData(self.currPage())
    };
    self.prePage=function(){
        if(self.currPage()==1){
            return;
        }
        self.getPageData(Number(self.currPage())-1)
    };
    self.selectImg=function(item){
        if(self.multiSelect()){
            if(item.selected()){
                item.selected(false);
                self.selectedItems.remove(item);
            }
            else{
                item.selected(true);
                self.selectedItems.push(item);
            };
        }else{
            if (self.selectedItem) {
                self.selectedItem.selected(false);
            };
            item.selected(true);
            self.selectedItem = item;
        }
    };
    self.cloneItem = function(item){
        var jitem = ko.mapping.toJS(item);
        return new ImgItem(jitem);
    };

    self.confirmSelect = function () {
        if(self.multiSelect()){
              if(self.selectedItems()&&self.selectedItems().length>0){
                  for(var i=0;i<self.selectedItems().length;i++){
                      var item=self.selectedItems()[i];
                      var newItem= self.cloneItem(item);
                      self.selectedImgList.push(newItem);
                  };

              };

        }else{
            if(self.selectedItem){
                self.selectedImg(self.selectedItem.imgUrl());
                self.selectedItem.selected(false);
            };
        };
        self.closeSelectImg();

    };

    self.search=function(){
        self.isSearch=true;
        self.getPageData(1);
    };
    self.closeSelectImg = function(){
        $("#PhotoGallery").hide();

    };
    self.init=function(){
        var setting = {
            callback: {
                onClick: zTreeOnClick=function(event, treeId, treeNode) {
                    self.currColumn=treeNode.id;
                    self.isSearch=false;
                    self.getPageData(1);
                }
            }
        };
        $.post("client/editors/photoGallery/serverhandler/getColumn.jsx",{m:self.merchantId},function (data) {
            self.currColumn=data.id;
            self.getPageData(1);
            $.fn.zTree.init($("#imgFileTree"),setting,data);
        }, "json");
    }
    self.init();
}

