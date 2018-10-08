function ProductItem(param) {
    this.id = ko.observable(param.id);
    this.imgUrl = ko.observable(param.logo || param.imgUrl);
    this.selected = ko.observable(false);

    this.name = ko.observable(param.name);
    this.merchantName = ko.observable(param.merchantName);
    this.salesAmount = ko.observable(param.salesAmount);
    this.sellingPoint = ko.observable(param.sellingPoint);
    this.sellableCount = ko.observable(param.sellableCount || "");
    this.weight = ko.observable(param.weight);
    this.memberPrice = ko.observable(param.memberPriceFormat || param.memberPrice);
    this.memberPriceString = ko.computed(function () {
        if (param.memberPriceFormat || param.memberPrice) {
            return "￥" + (param.memberPriceFormat || param.memberPrice);
        } else {
            return "暂无价格";
        }

    }, this);
    this.marketPrice = ko.observable(param.marketPriceFormat || param.marketPrice);
    this.marketPriceString = ko.computed(function () {
        if (param.marketPriceFormat || param.marketPrice) {
            return "￥" + (param.marketPriceFormat || param.marketPrice);
        } else {
            return "暂无价格";
        }

    }, this);
    var self = this;
    self.isCheck = ko.observable(false);
    self.shortIndex = ko.observable(param.shortIndex || 0);
    self.shortIndex.subscribe(function () {
        var val = self.shortIndex();
        if (typeof val !== "number") {
            if (isNaN(val)) {
                return
            } else {
                self.shortIndex(Number(val))
            }
        }
        var products = productGroupEditor.products();
        products = products.sort(function (a, b) {
            return a.shortIndex() - b.shortIndex()
        });
        productGroupEditor.products(products);
    });
}

function ProductGroupEditor(appId, pageId, merchantId, pageData, appEditor) {
    var self = this;
    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.pageData = pageData;
    self.appEditor = appEditor;
    self.dataId = null;
    self.spec = null;
    self.searchKeyWord = ko.observable();
    self.currColumn = null;
    self.displayLoading = ko.observable(false);
    self.selectedItem = ko.observableArray([]);
    /**当前操作选中的商品**/
    self.products = ko.observableArray([]);
    /**上次保存的商品列表**/
    self.productList = ko.observableArray([]);
    /**目录下的商品**/
    self.pageSize = 8;
    /**每页显示的条数**/
    self.currPage = ko.observable(1);
    /**当前页码**/
    self.pageCount = ko.observable();
    /**总页数**/
    self.editing = ko.observable(false);
    self.isUpdate = ko.observable(false);
    self.isSpecialPrice = ko.observable(false);//是否只显示特价商品,值为Y和N
    self.isPublic = ko.observable(false);//是否显示上架商品,值为1和0
    self.lowTotalPrice = ko.observable();//价格搜索最低价
    self.highTotalPrice = ko.observable();//价格搜索最高价
    self.updateItem = null;
    self.productType = ko.observable("normal");
    /*商品类型，有普通商品:normal,积分换购商品:integral,预售商品:preSale*/
    self.extraParam = ko.observable({});
    /*搜索商品时可以加一些扩展参数,如：是否预售isPreSale:Y,是否积分换购商品isIntegralBuy:Y*/
    self.isUploading = ko.observable(false);
    self.isKeepProducts = ko.observable(false);/*保留当前商品列表*/
    self.isInProductCheck = ko.observable(true);/*跳过已存在的商品*/

    self.beginEdit = function () {
        self.editing(true);
    };
    self.endEdit = function () {
        self.editing(false);
    };
    self.updateProduct = function (item) {
        self.openSelectProductView();
        self.isUpdate(true);
        self.updateItem = item;

    };
    self.specialPriceChange = function () {

    };

    /**根据目录获取商品列表**/
    self.getProductList = function (param) {
//        self.selectedItem.removeAll();/**清空选择内容**/
        $.ajax({
            type: "POST",
            url: "/widgets/productSelector/productList.jsp",
            dataType: "JSON",
            data: param,
            beforeSend: function () {
                self.displayLoading(true);
            },
            success: function (data) {
                self.displayLoading(false);
                var items = $.map(data.records, function (itemData) {
                    return new ProductItem(itemData);
                });
                self.productList(items);
                var length = Math.ceil(data.total / self.pageSize);
                self.pageCount(length);
                self.replaceObj(items, self.selectedItem());
            },
            complete: function () {
                self.displayLoading(false);
            }
        });
    };

    /**
     * 由于重新获取数据的时候创建了新的对象，需要通过该方法替换旧的对象，实现选中状态
     * @param productList
     * @param selectedItem
     * @returns {Array}
     */
    self.replaceObj = function (productList, selectedItem) {
        for (var i = 0; i < selectedItem.length; i++) {
            var oldProduct = selectedItem[i];
            for (var j = 0; j < productList.length; j++) {
                var newProduct = productList[j];
                if (oldProduct.id() == newProduct.id()) {
                    newProduct.selected(true);
                    selectedItem[i] = newProduct;
                }
            }
        }
    };

    self.delete = function (item) {
        self.products.remove(item);
    };

    self.closeProductGroupView = function () {
        $("#ProductGroupEditor").hide();

    };
    self.openSelectProductView = function () {
        self.selectedItem.removeAll();
        /**清空选择内容**/
        self.getPageData(1);
        $("#ProductSelect").show();
    };

    self.closeSelectProductView = function () {
        $("#ProductSelect").hide();
    };

    self.cloneItem = function (item) {
        var jitem = ko.mapping.toJS(item);
        return new ProductItem(jitem);
    };

    self.confirmSelect = function () {
        if (self.selectedItem() && self.selectedItem().length > 0) {
            if (self.isUpdate()) {
                var selectedItem = self.cloneItem(self.selectedItem()[0]);
                if (self.isSelected(selectedItem)) {
                    bootbox.alert("'"+selectedItem.name()+"'商品已被选择，不能重复选择!");
                    return;
                }
                selectedItem.shortIndex(self.updateItem.shortIndex());//将修改前的索引放到修改后的商品信息里
                self.products.replace(self.updateItem, selectedItem);
                self.isUpdate(false);
            } else {
                self.selectedItem().forEach(function (item) {
                    if (self.isSelected(item)) {
                        return;
                    }
                    self.products.push(self.cloneItem(item));
                    var products = self.products;
                    products = products.sort(function (a, b) {
                        return a.shortIndex() - b.shortIndex()
                    });
                    self.products(products);
                });
            }
        }
        self.closeSelectProductView();
    };

    self.isSelected = function (item) {
        if (!item) {
            return false;
        }
        var isFound = false;
        self.products().forEach(function (product) {
            if (product.id() == item.id()) {
                isFound =  true;
            }
        });
        return isFound;
    };

    self.selectProduct = function (item) {
        if (item.selected()) {
            item.selected(false);
            self.selectedItem.remove(item);
        }
        else {
            item.selected(true);
            self.selectedItem.push(item);
        }
    };

    self.up = function (item) {
        var index = self.products.indexOf(item);
        if (index == 0) {
            return
        }
        var array = self.products();
        var temp = array[index - 1].shortIndex();
        array[index].shortIndex(temp - 1);
        //array[index-1]=array[index];
        //array[index]=temp;
        self.products(array);

    };
    self.down = function (item) {
        var index = self.products.indexOf(item);
        if (index == self.products().length - 1) {
            return
        }
        var array = self.products();
        var temp = array[index + 1].shortIndex();
        array[index].shortIndex(temp + 1);
        //array[index+1]=array[index];
        //array[index]=temp;
        self.products(array);


    };
    self.check = function (item) {
        if (item.isCheck()) {
            item.isCheck(false)
        } else {
            item.isCheck(true)
        }
    };
    self.checkAll = function () {
        var products = self.products();
        for (var i = 0; i < products.length; i++) {
            products[i].isCheck(true)
        }
    };
    self.deleteProduct = function () {
        var products = self.products();
        for (var i = 0; i < products.length; i++) {
            if (products[i].isCheck()) {
                self.products.remove(products[i]);
                i--;
            }
        }
    };
    self.uploadExcel = function () {
        $("#uploadExcelHtml").modal();
    };
    self.editSort = function (item) {

    };

    self.saveDataToDB = function () {
        var data = ko.mapping.toJS(self.products);
        for (var i = 0; i < data.length; i++) {
            var imgUrl = data[i].imgUrl;
            imgUrl = self.appEditor.getImgSize(imgUrl, self.spec);
            data[i].imgUrl = imgUrl;
            data[i].spec = self.spec;
        }
        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };
        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'productGroup';
        param["dataType"] = "jsonArray"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        }
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (data) {
            if (data.state == "ok") {
                self.appEditor.setPageDataProperty(self.dataId, JSON.parse(param["dataValue"]));
                self.closeProductGroupView();
                self.closeSelectProductView();
                self.appEditor.refresh()
            } else {
                bootbox.alert("服务器错误，数据没有保存！");
            }
        }, "json");
    };

    self.getPageData = function (pageNum) {
        var start = (pageNum - 1) * self.pageSize;
        self.currPage(pageNum);
        var param = {
            limit: self.pageSize,
            oriColumnId: self.currColumn,
            merchantId: self.merchantId,
            isSearchIndex: true,
            start: start,
            title: self.searchKeyWord(),
            publishState: self.isPublic() ? 0 : 1,
            isSpecialPrice: self.isSpecialPrice(),
            lowTotalPrice: self.lowTotalPrice(),
            highTotalPrice: self.highTotalPrice()
        };
        param.productType = self.productType();
        if (self.extraParam()) {
            for (var k in self.extraParam()) {
                param[k] = self.extraParam()[k];
            }
        }
        self.getProductList(param);
    };
    self.nextPage = function () {
        if (self.currPage() == self.pageCount()) {
            return;
        }
        self.getPageData(Number(self.currPage()) + 1)
    };
    self.toPage = function () {
        if (self.currPage() < 1) {
            self.currPage(1);
        } else if (self.currPage() > self.pageCount()) {
            self.currPage(self.pageCount());
        }
        self.getPageData(self.currPage())
    };

    self.prePage = function () {
        if (self.currPage() == 1) {
            return;
        }
        self.getPageData(Number(self.currPage()) - 1)
    };
    self.search = function () {
        self.getPageData(1);
    };
    self.init = function () {
        var setting = {
            callback: {
                onClick: zTreeOnClick = function (event, treeId, treeNode) {
                    self.currColumn = treeNode.id;
                    self.searchKeyWord("");
                    self.getPageData(1);
                }
            }
        };
        $.post("client/editors/productGroup/serverhandler/getCatalogue.jsx", {
            columnId: "c_10000",
            m: self.merchantId
        }, function (data) {
            self.currColumn = data.id;
            $.fn.zTree.init($("#treeDemo"), setting, data);
        }, "json");
    };
    self.init();

    self.uploadText = ko.observable("上传");
    self.doUpload = function(){
        if(self.isUploading()){
            bootbox.alert("文件正在上传，请稍候");
            return;
        }
        var file = $("#file").val();
        if(!file){
            bootbox.alert("请选择要上传的文件");
            return;
        }
        self.uploadText("正在上传，请稍候...");
        self.isUploading(true);
        $("#uploadExcelForm").ajaxSubmit({
            dataType: "json",
            beforeSubmit: function(){
                $("#uploadExcelHtml").modal("hide");
                $("#uploadExcelOkHtml").modal();
            },
            error:function(err){
                self.uploadText("上传");
                self.isUploading(false);
                $("#uploadExcelOkHtml").modal("hide");
                bootbox.alert(err.responseText);
            },
            success: function(res) {
                self.uploadText("上传");
                self.isUploading(false);
                $("#uploadExcelHtml").modal("hide");
                $("#uploadExcelOkHtml").modal("hide");
                if(res.state != "ok"){
                    bootbox.alert(res.msg);
                }else{
                    if(!self.isKeepProducts()){
                        self.products([])
                    }
                    var isInProduct = self.isInProductCheck() && self.products().length > 0;
                    for (var i = 0; i < res.products.length; i++) {
                        var item = res.products[i];

                        if(isInProduct){
                            var productsIds =
                                $.map(self.products(), function (item) {
                                    return item.id();
                                });
                            if($.inArray(item.id,productsIds) == -1){
                                self.products().push(new ProductItem(item))
                            }
                        } else {
                            self.products().push(new ProductItem(item))
                        }
                    }
                    var  products = self.products();
                    products = products.sort(function(a, b){
                        return a.shortIndex() - b.shortIndex()
                    });
                    self.products(products);
                    var msg = "<div class='model'><hr/><h4>状态列表</h4>"+
                        "<table class='table table-condensed'><thead>"+
                        "<tr><td>#</td><td>SKU编码</td><td>商家</td><td>商品名称</td><td>信息</td></tr></thead><tbody>{{~it.list:value:index}}"+
                        "<tr class='{{=value.state == 'ok' ? 'success' : 'danger'}}'>"+
                        "<td>{{=index+1}}</td>"+
                        "<td>{{=value.skuId}}</td>"+
                        "<td>{{=value.merchantId}}</td>"+
                        "<td>{{=value.productName}}</td>"+
                        "<td>{{=value.msg}}</td>"+
                        "</tr>"+
                        "{{~}}"+
                        "</tbody>"+
                        "</table>"+
                        "</div>";
                    var interText = doT.template(msg);
                    bootbox.alert({
                        message:  interText({
                            successLength: res.log.successLength,
                            errorLength: res.log.errorLength,
                            list: res.log.list
                        })
                    });
                }
            }
        });
        return false;
    };
}
