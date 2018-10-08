function Item(data, parent) {
    var self = this;
    self.url = ko.observable(data.url);
    self.name = ko.observable(data.name);
    self.columnId = ko.observable(data.columnId);
    self.html = ko.observable(data.html);
    self.custom=ko.observable(data.custom||"false");
    self.sameLine = ko.observable(data.sameLine || false);
    self.currentLevel = data.level;
    self.parent = parent;
    self.selected = ko.observable(false);
    self.children = ko.observableArray();
    self.icon = ko.observable(data.icon);
    if (data.children) {
        for (var i = 0; i < data.children.length; i++) {
            var child = data.children[i];
            if(child) {
                child.level = data.level + 1;
                var childItem = new Item(child, self);
                self.children.push(childItem);
            }
        }
    }
};
function SelectCategoriesDialog(merchantId) {
    var self = this;
    self.merchantId = merchantId;
    self.categories = ko.observableArray();
    self.selectedCategories = ko.observableArray();

    self.openDialog = function (parentItem) {
        self.parentItem = parentItem;
        $('#fancyCategory_selectCategories').modal("show");
        $.post("/productCategoryApp/pages/handler/productColumns.jsx", {m: self.merchantId, id: self.parentItem.columnId()}, function (data) {
            if (data.state == 'ok') {
                var c = $.map(data.records, function (item) {
                    return new Item({name: item.name, columnId: item.id, level: self.parentItem.currentLevel + 1,custom:item.custom}, self.parentItem);
                });

                self.categories(c);
            }
            ;
        }, "json");
    };

    self.ok = function () {
        console.log(self.selectedCategories());

        self.parentItem.children(self.selectedCategories().concat(self.parentItem.children()));
        $('#fancyCategory_selectCategories').modal("hide");
    }
};

function ItemDialog() {
    var self = this;
    self.name = ko.observable();
    self.url = ko.observable();
    self.columnId = ko.observable();
    self.icon = ko.observable();
    self.custom=ko.observable("false");
    self.sameLine = ko.observable("false");
    self.openDialog = function (parentItem, currentItem) {
        self.parentItem = parentItem;
        self.currentItem = currentItem;
        if (currentItem) {
            self.name(currentItem.name());
            self.url(currentItem.url());
            self.columnId(currentItem.columnId());
            self.icon(currentItem.icon());
            self.custom(currentItem.custom());
            self.sameLine (currentItem.sameLine());
        }
        console.log("sameLine=" + self.sameLine());
        $('#fancyCategory_addItem').modal("show");
    };
    self.ok = function () {
        if (self.currentItem) {
            self.currentItem.name(self.name());
            self.currentItem.url(self.url());
            self.currentItem.columnId(self.columnId());
            self.currentItem.icon(self.icon());
            self.currentItem.custom(self.custom());
            self.currentItem.sameLine(self.sameLine());
        }
        else {
            var item = new Item({name: self.name(), columnId: self.columnId(), level: self.parentItem.currentLevel + 1, url: self.url(),custom:self.custom(),sameLine:self.sameLine()}, self.parentItem);
            var children = self.parentItem.children();
            children.push(item);
            self.parentItem.children(children);
        }

        $('#fancyCategory_addItem').modal("hide");
    }
};

function FancyCategoryEditor(appId, pageId, merchantId, pageData, appEditor) {
    var self = this;
    self.rootItem = new Item({url: "/", columnId: "c_10000", level: 0}, null);
    self.levelCurrentItems = ko.observableArray();
    self.levelCurrentItems.push(self.rootItem);
    self.pageData = pageData;
    self.appEditor = appEditor;

    self.appId = appId;
    self.pageId = pageId;
    self.merchantId = merchantId;
    self.dataId = null;
    self.subType = null;
    self.categoriesDialog = new SelectCategoriesDialog(merchantId);
    self.itemDialog = new ItemDialog();
    self.returnMainFrame = function () {
        self.appEditor.setCurrentPage("mainFrame");
        self.appEditor.refresh();
    };

    self.selectCategoriesDialog = function (parentItem) {
        self.categoriesDialog.openDialog(parentItem);
    };

    self.addItemDialog = function (parentItem) {
        self.itemDialog.openDialog(parentItem);
    };

    self.select = function (item) {
        var currentLevel = item.currentLevel;

        for (var j = 0; j < item.parent.children().length; j++) {
            var cItem = item.parent.children()[j];
            cItem.selected(false);
        }
        var newCurrentItems = self.levelCurrentItems().slice(0, currentLevel);
        self.levelCurrentItems(newCurrentItems);
        self.levelCurrentItems.push(item);
        item.selected(true);
        for (var k = 0; k < item.children().length; k++) {
            var kitem = item.children()[k];
            if (kitem.selected()) {
                self.select(kitem);
                kitem.parent = item;
            }
            ;
        }
        ;
    };
    self.deleteItem = function (item) {
        bootbox.confirm("确定删除吗？", function (result) {
            if (result) {
                var currentLevel = item.currentLevel;
                item.parent.children.remove(item);
                var newCurrentItems = self.levelCurrentItems().slice(0, currentLevel);
                self.levelCurrentItems(newCurrentItems);
            }
            ;
        });
    };
    self.editItem = function (item) {
        self.itemDialog.openDialog(item.parent, item);
    };
    self.setDataId = function (dataId) {
        self.dataId = dataId;
        var data = self.appEditor.getPageDataProperty(dataId);
        if (!data) {
            self.rootItem = new Item({url: "/", columnId: "c_10000", level: 0}, null);
        }
        else {
            data.level = 0;
            self.rootItem = new Item(data, null);
        }
        self.levelCurrentItems.removeAll();
        self.levelCurrentItems.push(self.rootItem);
    };

    self.save = function () {
        var mapping = {
            'ignore': ["propertyToIgnore", "parent"]
        };
        var data = ko.mapping.toJS(self.rootItem, mapping);

        var param = {
            appId: self.appId,
            pageId: self.pageId,
            m: self.merchantId
        };


        param["dataId"] = self.dataId;
        param["dataValue"] = JSON.stringify(data);
        param['type'] = 'fancyCategories';
        param["dataType"] = "json"; //还可以是string
        if (self.subType) {
            param["subType"] = self.subType;
        };
        $.post("/appMarket/appEditor/savePageDataEx.jsp", param, function (ret) {
            if (ret.state != 'ok') {
                bootbox.alert("服务器错误，数据没有保存！");
            }
            else {
                bootbox.alert("数据保存成功！");
                //从服务器上重新加载数据，因为可能数据发生了变化
                self.appEditor.setPageDataProperty(self.dataId, data);
                self.appEditor.loadPageData(self.dataId);
            };
        }, "json");
    };


};