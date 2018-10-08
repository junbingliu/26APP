//#import editorPage.js
(function ProductGroup(e, configs) {

    var self = {};
    /*防止第一次执行的时候重复binding,调用appEditor.refresh()就会第二次执行*/
    var productGroupEditor = window["productGroupEditor"];
    if(productGroupEditor){
        self.editorViewModel = productGroupEditor;
    }
    else{
        self.editorViewModel = new ProductGroupEditor(configs.appId,configs.pageId,configs.m,configs.pageData,configs.appEditor);
        ko.cleanNode(document.getElementById("ProductGroupEditorModel"));
        ko.applyBindings(self.editorViewModel,document.getElementById("ProductGroupEditorModel"));
        window["productGroupEditor"] = self.editorViewModel;
    }

    self.clicking = false;
    $("[data-type='productGroup']", e).mouseenter(function (evt) {

        if(self.clicking){
            self.clicking = false;
            return;
        }

        var currentElem = $(this);
        var eventList = [{
            event:"click",
            fn:function(evt){
                self.clicking = true;
                var mask = $(evt.currentTarget);
                mask.hide();

                /*商品类型，有普通商品:normal,积分换购商品:integral,预售商品:preSale*/
                var productType = currentElem.attr("product-type");
                if(!productType){
                    productType = "normal";
                }
                /*搜索商品时可以加一些扩展参数,如：是否预售isPreSale:Y,是否积分换购商品isIntegralBuy:Y*/
                var extraParam =currentElem.attr("extraParam");
                if(!extraParam){
                    extraParam = {};
                }else{
                    try {
                        extraParam = JSON.parse(extraParam+"");
                    } catch (e) {
                        console.log(e);
                        extraParam = {};
                    }
                }

                var dataId = currentElem.attr("data-id");
                var spec = currentElem.attr("data-spec");
                self.editorViewModel.dataId = dataId;
                self.editorViewModel.spec = spec;
                self.editorViewModel.productType(productType);
                self.editorViewModel.extraParam(extraParam);
                if(configs.pageData){
                    var data=configs.appEditor.getPageDataProperty(dataId);
                    if(data){
                        var products = $.map(data, function (itemData) {
                            return new ProductItem(itemData);
                        });
                        products = products.sort(function(a, b){
                            return a.shortIndex() - b.shortIndex()
                        });
                        self.editorViewModel.products(products);
                    }else{
                        self.editorViewModel.products([]);
                    }
                }
                configs.appEditor.modal("ProductGroupEditor","true");
                $("#ProductGroupEditor").draggable({ handle: ".modal-header" });
                $("#ProductSelect").draggable({ handle: ".modal-header" });
                mask.off("click");
            }
        }];
        configs.appEditor.maskMake(currentElem,e,eventList);
        evt.stopPropagation();
    });

    $('.dropdown-menu').click(function(e) {
        e.stopPropagation();
    });

})($root, $configs);