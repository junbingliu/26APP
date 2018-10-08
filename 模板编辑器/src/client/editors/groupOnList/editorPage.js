function GroupOnItem(param) {
    this.id = ko.observable(param.id);
    this.productId = ko.observable(param.productId);
    this.imgUrl = ko.observable(param.imgUrl);
    this.selected = ko.observable(false);
    this.title = ko.observable(param.title);
    this.price=ko.observable(param.price);
    this.count=ko.observable(param.count||0);
    this.discount=ko.computed(function() {
        return (param.price/param.marketPrice*10).toFixed(1);
    }, this);
    this.marketPrice=ko.observable(param.marketPrice);
    this.marketPriceString= ko.computed(function() {
        return "￥" + parseFloat(param.marketPrice/100).toFixed(2)
    }, this);
    this.priceString = ko.computed(function() {
        return "￥" + parseFloat(param.price/100).toFixed(2)
    }, this);
    this.buyTime = ko.observable(param.buyTime);
    this.startDate = ko.observable(param.startDate);
    this.endDate = ko.observable(param.endDate);
    this.sellingPoint = ko.observable(param.sellingPoint);
};

function GroupOnListEditor(appId,pageId,merchantId,pageData,appEditor){
    var self  = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.spec = null;
    self.selectedItem=ko.observableArray([]);/**当前操作选中的商品**/
    self.products=ko.observableArray([]);/**上次保存的商品列表**/
    self.pageSize=8;/**每页显示的条数**/
    self.currPageData=ko.observableArray([]);/**当前页面的数据**/
    self.currPage=ko.observable(1);/**当前页码**/
    self.pageCount=ko.observable();/**总页数**/
    self.editing = ko.observable(false);
    self.searchKeyWord=ko.observable();
    self.state=ko.observable("current");
    self.beginEdit = function(){
        self.editing(true);
    };
    self.endEdit = function(){
            self.editing(false);
     };

    /**根据目录获取商品列表**/
    self.getProductList=function(offset,callback){
        self.selectedItem.removeAll();/**清空选择内容**/
        $.post("client/editors/groupOnList/serverhandler/getGroupOnList.jsx",{m:self.merchantId,offset:offset,count:self.pageSize,keyword:self.searchKeyWord(),state:self.state()}, function (data) {
            var items = $.map(data.products, function (itemData) {
                    return new GroupOnItem(itemData);
            });
            var length=Math.ceil(data.total/self.pageSize);
            self.pageCount(length);
            if(callback){
                callback(items);
            }
        }, "json");
    };
    self.delete = function (item) {
        self.products.remove(item);
    };
    self.up=function(item){
        var index=self.products.indexOf(item);
        if(index==0){return};
        var array=self.products();
        var temp=array[index-1];
        array[index-1]=array[index];
        array[index]=temp;
        self.products(array);
    };
    self.down=function(item){
        var index=self.products.indexOf(item);
        if(index==self.products().length-1){return};
        var array=self.products();
        var temp=array[index+1];
        array[index+1]=array[index];
        array[index]=temp;
        self.products(array);
    };

    self.search=function(){
        if(self.searchKeyWord()){
            self.state("search");
        }else{
            self.state("");
        }
        self.getPageData(1);
    };
    self.openSelectProductView = function(){
        self.selectedItem.removeAll();/**清空选择内容**/
        self.getPageData(1);
        $("#GroupOnSelect").show();
    };

    self.closeSelectProductView = function(){
        $("#GroupOnSelect").hide();
    };
    self.closeGroupOnListEditorView = function(){
        $("#GroupOnListEditor").hide();
    };

    self.selectProduct=function(item){
        if(item.selected()){
            item.selected(false);
            self.selectedItem.remove(item);
        }
        else{
            item.selected(true);
            self.selectedItem.push(item);
        };
    };
    self.cloneItem = function(item){
        var jitem = ko.mapping.toJS(item);
        return new GroupOnItem(jitem);
    };
    self.confirmSelect = function () {
        if (self.selectedItem() && self.selectedItem().length > 0) {
            self.selectedItem().forEach(function(item){
                item.selected(false);
                self.products.push(self.cloneItem(item));
            });
        };
        self.closeSelectProductView();
    };
    self.saveDataToDB=function(){
        var data = ko.mapping.toJS(self.products);
        for(var i=0;i< data.length;i++){
            var imgUrl=data[i].imgUrl;
            imgUrl=self.appEditor.getImgSize(imgUrl,self.spec);
            data[i].imgUrl=imgUrl;
        }
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'groupOnList';
        param["dataType"] = "jsonArray"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (data) {
            if(data.state=="ok"){
                self.appEditor.setPageDataProperty(self.dataId,JSON.parse(param["dataValue"]));
                self.closeSelectProductView();
                self.closeGroupOnListEditorView();
                self.appEditor.refresh();
            }else{
                bootbox.alert("服务器错误，数据没有保存！");
            };
        }, "json");
    }
    self.getPageData=function(pageNum){
        self.currPage(pageNum);
         var offset=(pageNum-1)*self.pageSize;
         var callback=function(items){
             self.currPageData(items);
         }
         self.getProductList(offset,callback);

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


};
