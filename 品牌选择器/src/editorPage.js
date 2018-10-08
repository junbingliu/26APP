function BrandItem(param) {
    var param = param || {};
    this.id = ko.observable(param.id);
    this.imgUrl = ko.observable(param.logo||param.imgUrl);
    this.selected = ko.observable(false);
    this.name = ko.observable(param.name);
};

function BrandSelector(merchantId){
    var self  = this;
    self.merchantId = merchantId;
    self.spec = null;
    self.searchKeyWord=ko.observable();
    self.currColumn=null;
    self.displayLoading=ko.observable(false);
    self.selectedItems=ko.observableArray([]);/**当前操作选中的品牌**/
//    self.products=ko.observableArray([]);/**上次保存的商品列表**/
    self.itemList=ko.observableArray([]);/**目录下的品牌**/
    self.pageSize=24;/**每页显示的条数**/
    self.currPage=ko.observable(1);/**当前页码**/
    self.pageCount=ko.observable();/**总页数**/
    self.editing = ko.observable(false);

    self.beginEdit = function(){
        self.editing(true);
    };
    self.endEdit = function(){
        self.editing(false);
    };
    self.callback = null;

    /**根据目录获取品牌列表**/
    self.getItemList=function(param){
        self.selectedItems.removeAll();/**清空选择内容**/
        $.ajax({
            type: "POST",
            url: "/widgets/brandSelector/BrandList.jsp",
            dataType:"JSON",
            data: param,
            beforeSend:function(){
                self.displayLoading(true);
            },
            success: function(data){
                self.displayLoading(false);
                var items = $.map(data.records, function (itemData) {
                    return new BrandItem(itemData);
                });
                self.itemList(items);
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
        var param={limit:self.pageSize,start:start,brandColumnId:self.currColumn,merchantId:self.merchantId,isSearch:true,title:self.searchKeyWord()};
        self.getItemList(param);
    };


    self.openSelectView = function(callback){
        self.callback = callback;
        self.selectedItems.removeAll();/**清空选择内容**/
        self.getPageData(1);
        $("#BrandSelector").show();
    };

    self.closeSelectView = function(){
        $("#BrandSelector").hide();
    };

    self.cloneItem = function(item){
        var jitem = ko.mapping.toJS(item);
        return new Item(jitem);
    };

    self.confirmSelect = function () {
        if (self.selectedItems() && self.selectedItems().length > 0) {
            if(self.callback) {
                self.callback(self.selectedItems());
            }
        };
        self.closeSelectView();
    };

    self.select=function(item){
        if(item.selected()){
            item.selected(false);
            self.selectedItems.remove(item);
        }
        else{
            item.selected(true);
            self.selectedItems.push(item);
        };
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
                }
            }
        };
        $.post("/brandSelector/serverhandler/getCatalogue.jsx",{columnId:"c_brand_00001"},function (data) {
            self.currColumn=data.id;
            $.fn.zTree.init($("#treeBrand_BrandSelector"),setting,data);
        }, "json");
    }
    self.init();
};
