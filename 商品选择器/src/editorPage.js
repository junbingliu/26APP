function ProductItem(param) {
    this.id = ko.observable(param.id);
    this.imgUrl = ko.observable(param.logo||param.imgUrl);
    this.selected = ko.observable(false);

    this.name = ko.observable(param.name);
    this.salesAmount = ko.observable(param.salesAmount);
    this.memberPrice = ko.observable(param.memberPriceFormat||param.memberPrice);
    this.memberPriceString = ko.computed(function() {
        if(param.memberPriceFormat||param.memberPrice){
            return "￥" + (param.memberPriceFormat||param.memberPrice);
        }else{
            return "暂无价格";
        }

    }, this);
    this.marketPrice = ko.observable(param.marketPriceFormat||param.marketPrice);
    this.supplyPrice = ko.observable(param.supplyPrice);
    this.hasMultiSkus = ko.observable(param.hasMultiSkus);
    this.merchantName = ko.observable(param.merchantName);
    this.marketPriceString = ko.computed(function() {
        if(param.marketPriceFormat||param.marketPrice){
            return "￥" + (param.marketPriceFormat||param.marketPrice);
        }else{
            return "暂无价格";
        }
    }, this);
};

function ProductSelector(merchantId){
    var self  = this;
    self.merchantId = merchantId;
    self.dataId = null;
    self.spec = null;
    self.searchKeyWord=ko.observable();
    self.brandItem = new BrandItem();
    self.currColumn=null;
    self.displayLoading=ko.observable(false);
    self.selectedItem=ko.observableArray([]);/**当前操作选中的商品**/
    self.products=ko.observableArray([]);/**上次保存的商品列表**/
    self.productList=ko.observableArray([]);/**目录下的商品**/
    self.pageSize=24;/**每页显示的条数**/
    self.currPage=ko.observable(1);/**当前页码**/
    self.pageCount=ko.observable();/**总页数**/
    self.editing = ko.observable(false);
    self.categoryRootId = "c_10000";
    self.flag=false;/*标记全选还是反选*/
    self.selectBrand = function(){
        var brandSelector= window['brandSelector'];
        if(!brandSelector){
            console.log("brandSelector is null");
        }
        else{
            brandSelector.openSelectView(function(selectedItems){
                if(selectedItems && selectedItems.length>0){
                    self.brandItem.name(selectedItems[0].name());
                    self.brandItem.id(selectedItems[0].id());
                    self.brandItem.imgUrl(selectedItems[0].imgUrl());
                    self.getPageData(1);
                }
            });
        }
    };
    self.clearBrand = function(){
        self.brandItem.name(null);
        self.brandItem.id(null);
        self.brandItem.imgUrl(null);
        self.getPageData(1);
    };
    self.isNotBrandEmpty = ko.computed(function(){
        return (self.brandItem.id()!=null);
    });

    self.beginEdit = function(){
        self.editing(true);
    };
    self.endEdit = function(){
        self.editing(false);
    };
    self.callback = null;

    /**根据目录获取商品列表**/
    self.getProductList=function(param){
        self.selectedItem.removeAll();/**清空选择内容**/
        self.flag = false;
        $.ajax({
            type: "POST",
            url: "/widgets/productSelector/productList.jsp",
            dataType:"JSON",
            data: param,
            beforeSend:function(){
                self.displayLoading(true);
            },
            success: function(data){
                self.displayLoading(false);
                var items = $.map(data.records, function (itemData) {
                    return new ProductItem(itemData);
                });
                self.productList(items);
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
        var param={limit:self.pageSize,oriColumnId:self.currColumn,merchantId:self.merchantId,isSearchIndex:true,start:start,title:self.searchKeyWord()};
        if(self.isNotBrandEmpty()){
            param.brand = self.brandItem.name();
        }
        self.getProductList(param);
    };
    self.delete = function (item) {
        self.products.remove(item);
    }

    self.openSelectProductView = function (callback, categoryRootId, merchantId) {
        if ((categoryRootId && categoryRootId != self.categoryRootId) || (merchantId && merchantId != self.merchantId)) {
            self.categoryRootId = categoryRootId;
            self.currColumn = categoryRootId;
            self.merchantId = merchantId;
            self.init();
        }
        self.callback = callback;
        self.selectedItem.removeAll();/**清空选择内容**/
        self.getPageData(1);
        $("#ProductSelect").show();
    };

    self.closeSelectProductView = function(){
        $("#ProductSelect").hide();
    };

    self.cloneItem = function(item){
        var jitem = ko.mapping.toJS(item);
        return new ProductItem(jitem);
    };

    self.confirmSelect = function () {
        if (self.selectedItem() && self.selectedItem().length > 0) {
            if(self.callback) {
                self.callback(self.selectedItem());
            }
        };
        self.closeSelectProductView();
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
    self.selectAll=function(){
        for(var i=0;i<self.productList().length;i++){
            var item=self.productList()[i];
            if(self.flag){
                item.selected(false);
                self.selectedItem.removeAll();
            }else{
                item.selected(true);
                self.selectedItem.push(item);
            }
        }
        if(self.flag){
            self.flag=false;
        }else{
            self.flag=true;
        }
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

    self.search=function(){
        self.getPageData(1);
    };
    self.init=function(){
        var setting = {
            callback: {
                onClick: zTreeOnClick=function(event, treeId, treeNode) {
                    self.currColumn=treeNode.id;
                    self.searchKeyWord("");
                    self.getPageData(1);
                    $("#" + event.toElement.id).css("background-color","#b3d1c1");
                    $("span").not("#" + event.toElement.id).css("background-color","");
                }
            }
        };
        $.post("/productSelector/serverhandler/getCatalogue.jsx",{columnId:self.categoryRootId},function (data) {
            self.currColumn=data.id;
            try{
                $.fn.zTree.destroy("productSelectorTree");
            }
            catch(e){

            }
            $.fn.zTree.init($("#productSelectorTree"),setting,data);
        }, "json");
    }
    self.init();
};
