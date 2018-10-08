/**
 * Created by Administrator on 2015-09-06.
 */


function Option(data) {
    this.productId = ko.observable(data.productId);
    if (data.percentage) {
        this.percentage = ko.observable(data.percentage);
    } else {
        this.percentage = ko.observable("");
    }
    this.unitPrice = ko.observable(data.unitPrice);
    this.priceType = ko.observable(data.priceType);
    this.num = ko.observable(data.num);
    this.skuIds = ko.observable(data.skuIds);
    if (data.isDefault) {
        this.isDefault = ko.observable(data.isDefault);
    } else {
        this.isDefault = ko.observable("");
    }

}

function Part(data) {
    this.name = ko.observable(data.name);
    if (data.options) {
        this.options = ko.observableArray(ko.utils.arrayMap(data.options, function (option) {
            return new Option(option);
        }));
    } else {
        this.options = ko.observableArray([]);
    }
    //if (data.productListViewModel) {
    //    this.productListViewModel = ko.observable(data.productListViewModel);
    //} else {
    //    this.productListViewModel = ko.observable(null);
    //}
    this.partId = ko.observable(data.partId);
    this.tag = ko.observable(data.tag);
}


function ProductForm() {
    var self = this;
    ko.components.register('file-list', {require: '/koComponents/modules/filesList/filesList.jsx'});
    ko.components.register('html-editor', {require: '/koComponents/modules/htmlEditor/htmlEditor.jsx'});
    ko.components.register('product-list', {require: '/koComponents/modules/productList/productList.jsx'});
    ko.components.register('price-editor', {require: '/koComponents/modules/priceEditor/priceEditor.jsx'});
    ko.components.register('extended-forms', {require: '/koComponents/modules/extendedForms/extendedForms.jsx'});
    self.m = m;
    self.id = ko.observable();
    self.title = ko.observable();
    self.seriesCode = ko.observable();  //系列编码
    self.seriesDiffName = ko.observable(); //系列内名称，例如 ‘红色’
    self.seriesInfoAbout = ko.observable();  //系列特点介绍
    self.images = ko.observableArray([]);
    self.fileListViewModel = ko.observable();
    self.pcHtml = ko.observable("pc 版详细描述");
    self.phoneHtml = ko.observable("phone 版详细描述,如果不填则默认取pc版的详细描述。");
    self.padHtml = ko.observable("pad 版详细描述，如果不填则默认取pc版的详细描述。");
    self.currentDetailView = ko.observable("pc");
    self.parts = ko.observableArray([]);
    self.productItems = ko.observableArray([]);
    self.columnIds = ko.observableArray([]);
    self.canAdd = ko.observable(true);
    self.fixedPrice = ko.observable(false);

    self.skus = ko.observableArray([]);

    self.sales = ko.observable();//商品销量
    self.idList = ko.observableArray([]);//户型id组
    self.productListViewModel = ko.observable(null);
    self.priceList = ko.observableArray([]);
    self.priceEditor = ko.observable();
    self.extendedForms = ko.observable(null);
    self.combiPrice = ko.computed(function () {
        var combiPrice = 0;
        $.each(self.parts(), function (idx, part) {
            var options;
            if ($.isFunction(part.options)) {
                options = part.options();
            } else {
                options = part.options;
            }
            $.each(options, function (index, option) {
                if ($.isFunction(option.price) && option.price()) {
                    var price = option.price() || option.memberPrice();
                } else {
                    var price = option.price;
                }
                var priceType;
                if ($.isFunction(option.priceType) && option.priceType()) {
                    priceType = option.priceType();
                } else {
                    priceType = option.priceType;
                }

                var percentage;
                if ($.isFunction(option.percentage) && option.percentage()) {
                    percentage = option.percentage();
                } else {
                    percentage = option.percentage;
                }
                if (priceType.priceTypeValue === "percent") {
                    price = (price * percentage / 100).toFixed(2);
                }
                if ($.isFunction(option.num) && option.num()) {
                    var num = option.num();
                }
                else {
                    var num = option.num;
                }
                combiPrice += price * Number(num);
            });
        });
        return (combiPrice * 1).toFixed(2);
    });

    self.totalPrice = ko.computed(function () {
        var total = 0;
        $.each(self.parts(), function (idx, part) {
            var options;
            if ($.isFunction(part.options)) {
                options = part.options();
            } else {
                options = part.options;
            }
            var optionDefault = false;
            $.each(options, function (index, option) {
                var isDefault = false;

                if ($.isFunction(option.isDefault)) {
                    isDefault = option.isDefault();
                } else {
                    isDefault = option.isDefault;
                }
                if (isDefault) {
                    optionDefault = true;
                    if ($.isFunction(option.price) && option.price()) {
                        var price = option.price() || option.memberPrice();
                    } else {
                        var price = option.price;
                    }
                    var priceType;
                    if ($.isFunction(option.priceType) && option.priceType()) {
                        priceType = option.priceType();
                    } else {
                        priceType = option.priceType;
                    }

                    var percentage;
                    if ($.isFunction(option.percentage) && option.percentage()) {
                        percentage = option.percentage();
                    } else {
                        percentage = option.percentage;
                    }
                    if (priceType.priceTypeValue === "percent") {
                        price = (price * percentage / 100).toFixed(2);
                    }
                    if ($.isFunction(option.num) && option.num()) {
                        var num = option.num();
                    }
                    else {
                        var num = option.num;
                    }
                    total += price * Number(num);
                }
            });
            if (!optionDefault) {
                var option = part.options()[0];
                if (option) {
                    if ($.isFunction(option.price) && option.price()) {
                        var price = option.price() || option.memberPrice();
                    } else {
                        var price = option.price;
                    }
                    console.log(" price = " + price);
                    var priceType;
                    if ($.isFunction(option.priceType) && option.priceType()) {
                        priceType = option.priceType();
                    } else {
                        priceType = option.priceType;
                    }

                    var percentage;
                    if ($.isFunction(option.percentage) && option.percentage()) {
                        percentage = option.percentage();
                    } else {
                        percentage = option.percentage;
                    }
                    if (priceType.priceTypeValue === "percent") {
                        price = (price * percentage / 100).toFixed(2);
                    }
                    if ($.isFunction(option.num) && option.num()) {
                        var num = option.num();
                    }
                    else {
                        var num = option.num;
                    }
                    total += price * Number(num);
                }
            }
        });
        return (total * 1).toFixed(2);
    });
    self.marketPriceTotal = ko.computed(function () {
        var marketPriceTotal = 0;
        $.each(self.parts(), function (idx, part) {
            var optionDefault = false;
            $.each(part.options(), function (index, option) {
                var isDefault = false;

                if ($.isFunction(option.isDefault)) {
                    isDefault = option.isDefault();
                } else {
                    isDefault = option.isDefault;
                }
                if (isDefault) {
                    optionDefault = true;
                    if ($.isFunction(option.marketPrice)) {
                        var marketPrice = option.marketPrice();
                    } else {
                        var marketPrice = option.marketPrice;
                    }
                    var num;
                    if ($.isFunction(option.num) && option.num()) {
                        num = option.num();
                    }
                    else {
                        num = option.num;
                    }
                    marketPriceTotal += marketPrice * Number(num);
                }
            });
            if (!optionDefault) {
                var option = part.options()[0];
                if (option) {
                    if ($.isFunction(option.marketPrice)) {
                        var marketPrice = option.marketPrice();
                    } else {
                        var marketPrice = option.marketPrice;
                    }
                    var num;
                    if ($.isFunction(option.num) && option.num()) {
                        num = option.num();
                    }
                    else {
                        num = option.num;
                    }
                    marketPriceTotal += marketPrice * Number(num);
                }
            }
        });

        return (marketPriceTotal * 1).toFixed(2);
    });

    self.memberPriceTotal = ko.computed(function () {
        var memberPriceTotal = 0;
        $.each(self.parts(), function (idx, part) {
            var optionDefault = false;
            $.each(part.options(), function (index, option) {
                var isDefault = false;

                if ($.isFunction(option.isDefault)) {
                    isDefault = option.isDefault();
                } else {
                    isDefault = option.isDefault;
                }
                if (isDefault) {
                    optionDefault = true;
                    if ($.isFunction(option.memberPrice)) {
                        var memberPrice = option.memberPrice();
                    } else {
                        var memberPrice = option.memberPrice;
                    }
                    if ($.isFunction(option.num) && option.num()) {
                        var num = option.num();
                    }
                    else {
                        var num = option.num;
                    }
                    memberPriceTotal += memberPrice * Number(num);
                }
            });
            if (!optionDefault) {
                var option = part.options()[0];
                if (option) {
                    var memberPrice;
                    if ($.isFunction(option.memberPrice)) {
                        memberPrice = option.memberPrice();
                    } else {
                        memberPrice = option.memberPrice;
                    }
                    var num;
                    if ($.isFunction(option.num) && option.num()) {
                        num = option.num();
                    }
                    else {
                        num = option.num;
                    }
                    memberPriceTotal += memberPrice * Number(num);
                }
            }
        });
        return (memberPriceTotal * 1).toFixed(2);
    })

    self.showNotification = ko.observable(false);
    self.notification = ko.observable("");

    self.notifyUser = function (msg, duration) {
        self.notification(msg);
        self.showNotification(true);
        setTimeout(function () {
            self.showNotification(false)
        }, duration);
    };

    self.productExtraUrl = ko.computed(function () {
        return "/productExtraManager/home.jsx?m=" + m + "&productId=" + self.id();
    });
    self.productExtraVisible = ko.computed(function () {
        if (self.id()) {
            return true;
        }
        return false;
    });
    self.save = function () {
        var fileIds = $.map(self.images(), function (img) {
            return img.fileId;
        });
        var partBoolean = false;
        try {
            var parts = $.map(self.parts(), function (part) {
                if (part.options() == null || part.options().length == 0) {
                    throw "你的某些部件还没有选择选项,请先选择选项。";
                    return;
                }
                var options = $.map(part.options(), function (option) {
                    var skuIds = [];
                    $.each(option.skus, function (idx, sku) {
                        if (sku.selected()) {
                            skuIds.push(sku.id);
                        }
                    });
                    console.log(option)
                    console.log("====================================================")
                    return {
                        productId: option.productId,
                        merchantId: option.merchantId,
                        marketPrice: option.marketPrice,
                        price: option.price(),
                        num: option.num(),
                        priceType: option.priceType().priceTypeValue,
                        percentage: option.percentage(),
                        isDefault: option.isDefault(),
                        skuIds: skuIds
                    };
                });
                console.log(options);
                if (part.name() == null || part.name() === "" || part.tag() == null || part.tag() === "") {
                    throw "你的某些部件未设置名称或标签，请完善资料。";
                }
                return {
                    name: part.name(),
                    tag: part.tag(),
                    partId: part.partId(),
                    options: options
                };
            });
        } catch (error) {
            bootbox.alert(error);
            return;
        }

        if (!self.title()) {
            bootbox.alert("你还没有填写组合选项名称,填写组合商品名称。");
            return;
        }
        if (!self.seriesCode()) {
            bootbox.alert("你还没有填写系列编码，请先填写系列编码。");
            return;
        }
        if (!self.seriesDiffName()) {
            bootbox.alert("你还没有填写系列内名称，请先填写系列内名称。");
            return;
        }

        if (!self.sales()) {
            self.sales(0);
        }
        //if(!self.seriesInfoAbout()){
        //    bootbox.alert("你还没有填写系列的介绍，请先填写！");
        //    return;
        //}
        if (self.fixedPrice()) {
            if (!self.priceList() || self.priceList().length == 0) {
                bootbox.alert("你还没有编辑价格，请先编辑价格。");
                return;
            }
        }
        if (!self.images() || self.images().length == 0) {
            bootbox.alert("你还没有添加商品主图，请先添加商品主图。");
            return;
        }
        if (!self.priceEditor().isValid()) {
            bootbox.alert("价格不正确,请先改正价格设置。");
            return;
        }
        if (!self.extendedForms()) {
            bootbox.alert("界面还在初始化,请稍候......");
            return;
        }
        //if(!self.fangXingCodes()){
        //    bootbox.alert("还没有选择适用房型，请先选择适用房型！");
        //    return;
        //}
        var priceRecs = [];
        $.each(self.priceList(), function (idx, priceRec) {
            var p = {
                entityType: priceRec.entityType(),
                entityId: priceRec.entityId(),
                price: (priceRec.price() * 1).toFixed(2),
                isSpecial: priceRec.isSpecial(),
                beginTime: priceRec.beginTime().getTime(),
                endTime: priceRec.endTime().getTime()
            };
            priceRecs.push(p);
        });
        var extended = self.extendedForms().getValues();

        var combiProduct = {
            id: self.id(),
            title: self.title(),
            seriesCode: self.seriesCode(),
            seriesDiffName: self.seriesDiffName(),
            fileIds: fileIds,
            pcHtml: self.pcHtml(),
            phoneHtml: self.phoneHtml(),
            merchantId: m,
            padHtml: self.padHtml(),
            parts: parts,
            price: (self.combiPrice() * 1).toFixed(2),
            priceRecs: priceRecs,
            fixedPrice: self.fixedPrice() ? "Y" : "N",
            seriesInfoAbout: self.seriesInfoAbout(),
            columnIds: self.columnIds(),
            extended: extended,
            version: "code_2"
        };
        $.post("server/saveCombiProduct.jsx", {combiProduct: JSON.stringify(combiProduct), m: m}, function (ret) {
            if (ret.state == 'ok') {
                self.id(ret.id);
                self.notifyUser("保存成功！编号为：" + ret.id, 1500);
            }
            else {
                self.notifyUser("保存失败！失败原因：" + ret.msg, 2000);
            }
        }, "json");

    };


    self.chooseCategory = function () {
        productCategorySelector.openSelectView(function (nodes) {
            if (nodes) {
                var columnIdsArr = $.map(nodes, function (node) {
                    return node.id
                });
                var columnIds = columnIdsArr.join(",");
                self.columnIds(columnIds);
            }
        });
    };

    self.clear = function () {
        self.id("");
        self.title("");
        self.seriesCode("");  //系列编码
        self.seriesDiffName(""); //系列内名称，例如 ‘红色’
        self.images([]);
        self.pcHtml("pc 版详细描述");
        self.phoneHtml("phone 版详细描述,如果不填则默认取pc版的详细描述。");
        self.padHtml("pad 版详细描述，如果不填则默认取pc版的详细描述。");
        self.currentDetailView("pc");
        if (self.extendedForms()) {
            self.extendedForms().initValues();
        }
        self.parts([]);
        self.priceList([]);


    };
    self.setCombiProductId = function (id) {
        self.clear();
        if (id) {
            self.load(id);
        }
    };

    self.load = function (id) {
        //从数据库load数据
        $.post("server/loadCombiProduct.jsx", {m: m, id: id, spec: "150X150"}, function (ret) {
            if (ret.state != "ok") {
                bootbox.alert("网络异常。");
                return;
            }
            var combiProduct = ret.combiProduct;
            self.id(combiProduct.id);
            self.title(combiProduct.title);
            self.seriesCode(combiProduct.seriesCode);
            self.seriesDiffName(combiProduct.seriesDiffName);
            self.columnIds(combiProduct.columnIds);
            if (combiProduct.images && self.fileListViewModel()) {
                self.images($.map(combiProduct.images, function (img) {
                    return self.fileListViewModel().createFileItem(img);
                }));
            }
            if (combiProduct.priceRecs) {
                self.priceList($.map(combiProduct.priceRecs, function (priceRec) {
                    return new PriceEditor.PriceRecord(priceRec);
                }));
            }
            else {
                self.priceList([]);
            }
            self.seriesInfoAbout(combiProduct.seriesInfoAbout);
            self.pcHtml(combiProduct.pcHtml);
            self.phoneHtml(combiProduct.phoneHtml);
            self.padHtml(combiProduct.padHtml);
            self.currentDetailView("pc");
            self.fixedPrice(combiProduct.fixedPrice);
            self.sales(combiProduct.sales);

            if (self.productListViewModel()) {
                self.parts.removeAll();
                $.each(combiProduct.parts, function (idx, part) {
                    var options = $.map(part.options, function (option) {
                        return new self.productListViewModel().createProductItem(option);
                    });
                    part = new Part(part);
                    part["options"] = ko.observableArray(options);
                    self.parts.push(part);
                });
            }

            if (self.extendedForms()) {
                self.extendedForms().setValues(combiProduct.extended);
            }

        }, "json")
    };
    //增加部件
    self.addPart = function () {
        self.parts.push(new Part({
            name: "",
            options: [],
            tag: "",
            partId: ""
        }));
    };
    //删除部件
    self.removePart = function (part) {
        var productItems = $.map(part.options(), function (option) {
            var skuIds = [];
            $.each(option.skus, function (idx, sku) {
                if (sku.selected()) {
                    skuIds.push(sku.id);
                }
            });
            return {
                productId: option.productId,
                price: option.price(),
                num: option.num(),
                tags: option.tags(),
                priceType: option.priceType().priceTypeValue,
                percentage: option.percentage(),
                isDefault: option.isDefault(),
                skuIds: skuIds
            }
        });
        self.parts.remove(part);
    };
}

var productForm = null;
$(function () {
    productForm = new ProductForm();
    ko.applyBindings(productForm, document.getElementById("productFormPage"));
});