function newProduct() {
    var self = this;
    self.productId = ko.observable("");
    self.name = ko.observable("");
    self.barcode = ko.observable("");//条码
    self.price =  ko.observable("");
    self.unitPrice =  ko.observable(0);
    self.marketPrice =  ko.observable("");
    self.details = ko.observableArray([]);//详情图片
    self.sellNum =  ko.observable(0);
    self.isMember = ko.observable(true);//是否会员专属
    self.isFreight = ko.observable(true);//是否需要运费
    self.freight = ko.observableArray([]);
    self.cash = ko.observable(0);
    self.priority = ko.observable(0);
    self.integral = ko.observable(0);
    self.columnName = ko.observable("");
    self.productDescription = ko.observable("");//
    self.stateList = ko.observableArray([
        { name: "已发布", id: "1" },
        { name: "已下架", id: "2" },
        { name: "草稿", id: "3" }
    ]);
    self.state = ko.observable("1");

    self.getProductI = function () {
        var productObjId = $("#productObjId").val();
        var data = {
            productObjId:productObjId,
            m:m
        };
        if(productObjId){
        $.post("../handler/getProductInformation.jsx",data,function (res) {
            self.productId(res.id);
            self.price(res.memberPrice);
            self.unitPrice(res.unitPrice || 0);
            self.marketPrice(res.marketPrice || res.memberPrice);
            self.name(res.name);
            self.barcode(res.barcode);
            self.details(res.mobileContent);
            self.sellNum(res.sellNum);
            self.columnName(res.columnName);
            self.isMember(res.isMember);//是否会员专属
            self.isFreight(res.isFreight);//是否需要运费
            self.productDescription(res.productDescription);
            self.priority(res.priority);
            self.freight(res.freight);
            self.cash(res.cash);
            self.integral(res.integral);
            self.state(res.state);
        },"json");
        }
    };
   self.getProductI();


    self.getProduct = function () {
        if (typeof productSelector === "undefined") {
            $.getScript("/productSelector/jsloader.jsx", function () {
                $.getScript("/brandSelector/jsloader.jsx", function () {
                    open()
                })
            })
        } else {
            open()
        }
        function open() {
            productSelector.openSelectProductView(function (selectedItems) {
                var ids = [];
                $.each(selectedItems, function (index, item) {
                        if(ids){
                            ids.push(item.id());
                        }
                });
                var data = {
                    productId:ids[0],
                    m:m
                };
                $.post("../handler/getProductInformation.jsx",data,function (res) {
                    self.productId(res.id);
                    self.price(res.memberPrice);
                    self.unitPrice(res.unitPrice || 0);
                    self.marketPrice(res.marketPrice || res.memberPrice);
                    self.name(res.name);
                    self.barcode(res.barcode);
                    self.details(res.mobileContent);
                    self.columnName(res.columnName);
                    self.sellNum(0);
                    self.cash(0);
                    self.integral(0);
                },"json");
            });
        }
    };
    self.saveProduct = function () {
        var freight =  self.freight();
        var cash = 0;
        var integral = 0;
        if(self.isFreight()){
        for(var i = 0; i < freight.length; i++){
            if(freight[i] == "isCash"){
                cash = self.cash();
            }
            if(freight[i] == "isIntegral"){
                integral = self.integral();
            }
        }
        }
        var data= {
            id:$("#productObjId").val(),
            activeId:$("#activeId").val(),
            productId:self.productId(),
            unitPrice:self.unitPrice(),
            marketPrice:self.marketPrice(),
            sellNum:self.sellNum(),
            isMember:self.isMember(),
            freight:self.freight().join(","),
            isFreight:self.isFreight(),
            priority:self.priority(),
            productDescription:self.productDescription(),
            state:self.state(),
            cash:cash,
            integral:integral,
            m:m
        };
        bootbox.confirm("是否保存", function (result) {
            if (result) {
                $.post("../handler/addProduct.jsx",data,function (res) {
                    if(res.state == "ok"){
                        bootbox.alert("保存成功");
                        window.history.back();
                    }
                },"json");
            }
        });
    }
}
var newProductPage = null;
$(document).ready(function () {
    newProductPage = new newProduct();
    ko.applyBindings(newProductPage, document.getElementById("newProduct"));
});