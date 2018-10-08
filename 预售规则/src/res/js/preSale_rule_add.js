function PreSaleRuleAddPage(configs) {
    var self = this;
    self.count = ko.observable(0);
    self.id = ko.observable();
    self.name = ko.observable(configs.name || "");
    self.rate = ko.observable(1);
    self.displayAmount = ko.observable();
    self.deposit = ko.observable();
    self.balance = ko.observable();
    self.totalPrice = ko.observable();
    self.type = ko.observable("1");
    self.depositBeginTime = ko.observable();
    self.depositEndTime = ko.observable();
    self.endTime = ko.observable();
    self.beginTime = ko.observable();
    self.stockingTime = ko.observable();
    self.createUserId = ko.observable();
    self.desc = ko.observable();
    self.products = ko.observableArray([]);
    self.scope = ko.observableArray([]);
    self.channel = ko.observableArray(["app", "h5"]);
    self.merchantId = ko.observable();
    self.createTime = ko.observable();
    self.deliveryBeginTime = ko.observable();
    self.deliveryEndTime = ko.observable();
    self.totalProducts = ko.computed(function () {
        return self.products().length;
    });

    self.setData = function (data) {
        data = data || {};
        self.id(data.id || "");
        self.name(data.name || "");
        self.rate(data.rate || 1);
        self.displayAmount(data.displayAmount || "");
        self.deposit(data.deposit || "");
        self.balance(data.balance || "");
        self.totalPrice(data.totalPrice || "");
        self.createUserId(data.createUserId || "");
        self.desc(data.desc || "");
        self.createTime(data.createTime ? new Date(data.createTime) : null);
        self.products(data.products ? data.products : []);
        self.merchantId(data.m || "");
        self.scope(data.scope || "");
        self.type(data.type || "");
        self.depositBeginTime(data.depositBeginTime || "");
        self.depositEndTime(data.depositEndTime || "");
        self.beginTime(data.beginTime || "");
        self.endTime(data.endTime || "");
        self.stockingTime(data.stockingTime || "");
        self.channel(data.channel || ["app", "h5"]);
        self.deliveryBeginTime(data.deliveryBeginTime || "");
        self.deliveryEndTime(data.deliveryEndTime || "");
    };
    self.getData = function () {
        var data = {};
        data.id = self.id();
        data.name = self.name();
        data.rate = self.rate();
        data.displayAmount = self.displayAmount();
        data.deposit = self.deposit();
        data.balance = self.balance();
        data.totalPrice = self.totalPrice();
        data.createUserId = self.createUserId();
        data.desc = self.desc();
        data.createTime = self.createTime();
        data.products = self.products();
        data.merchantId = self.merchantId();
        data.type = self.type();
        data.scope = self.scope();
        data.depositBeginTime = self.depositBeginTime();
        data.depositEndTime = self.depositEndTime();
        data.beginTime = self.beginTime();
        data.endTime = self.endTime();
        data.stockingTime = self.stockingTime();
        data.channel = self.channel();
        data.deliveryBeginTime = self.deliveryBeginTime();
        data.deliveryEndTime = self.deliveryEndTime();
        var oldProducts = self.products();
        var items = [];
        var count = 0;
        $.each(oldProducts, function (index, item) {
            var product = {};
            var id = item.id();
            var imgUrl = item.imgUrl();
            var name = item.name();
            var memberPrice = item.memberPrice();
            product.id = id;
            product.imgUrl = imgUrl;
            product.name = name;
            product.memberPrice = memberPrice;
            items.push(product);
        });
        data.items = items;
        var type = self.type();
        if (type == "2") {
            var scopes = [];
            $.each(scopeArray, function (index, scope) {
                var data = scope.getData();
                scopes.push(data);
            });
            data.scope = scopes;
        }
        data.totalProducts = count;
        return data;
    };

    self.addProducts = function () {
        productSelector.openSelectProductView(function (selectedItems) {
            var oldProducts = self.products();
            var oldProductIds = $.map(oldProducts, function (product) {
                return product.id();
            });
            $.each(selectedItems, function (index, item) {
                if (oldProductIds.indexOf(item.id()) == -1) {
                    oldProductIds.push(item.id());
                    oldProducts.push(item);
                }
            });
            self.products(oldProducts);
        });
    };
    self.clearProducts = function () {
        self.products([]);
    };
    self.deleteProduct = function (product) {
        self.products.remove(product);
    };
    self.typeChange = function () {
        var type = self.type();
        if (type == "2") {
            $("#balance").removeAttr("readOnly");
            $("#deposit").removeAttr("readOnly");
            $("#btnDiv").show();
            $("#sections").show();
            $("#depositDiv").show();
            $("#balanceDiv").hide();
            $("#totalPriceDiv").hide();
            $("#beginTimeDiv").show();
            $("#endTimeDiv").show();
        } else if (type == "3") {
            //如果是一次性付全款的也需要配置定金和尾款
            //$("#balanceDiv").hide();
            //$("#depositDiv").hide();
            $("#totalPriceDiv").show();
            $("#btnDiv").hide();
            $("#sections").hide();
            $("#beginTimeDiv").hide();
            $("#endTimeDiv").hide();

            $("#balance").attr("readOnly", "readOnly");
            $("#deposit").attr("readOnly", "readOnly");
            $("#balance").val("0");
            var totalPrice = $("#totalPrice").val();
            if (totalPrice) {
                $("#deposit").val(totalPrice);
                self.deposit(totalPrice);
                self.balance(0);
            }
        } else {
            $("#balance").removeAttr("readOnly");
            $("#deposit").removeAttr("readOnly");

            $("#beginTimeDiv").show();
            $("#endTimeDiv").show();
            $("#depositDiv").show();
            $("#balanceDiv").show();
            $("#totalPriceDiv").show();
            $("#btnDiv").hide();
            $("#sections").hide();
        }
    };
    self.save = function () {
        var postData = ko.mapping.toJS(self.getData());

        var type = self.type();
        var reg = /^[1-2]\d{3}-[0-1]\d-[0-3]\d [0-2]\d:[0-5]\d:[0-5]\d$/;
        if (!postData.name || postData.name.trim() == "") {
            bootbox.alert("规则名称不能为空。");
            return;
        }
        if (postData.displayAmount && isNaN(postData.displayAmount)) {
            bootbox.alert("预定人数只能是数字。");
            return;
        }
        if (!postData.depositBeginTime || postData.depositBeginTime.trim() == "") {
            bootbox.alert("定金支付开始时间不能为空。");
            return;
        }
        if(!reg.test(postData.depositBeginTime.trim())){
            bootbox.alert("请设置完整的定金支付开始时间。");
            return;
        }

        if (!postData.depositEndTime || postData.depositEndTime.trim() == "") {
            bootbox.alert("定金支付结束时间不能为空。");
            return;
        }
        if(!reg.test(postData.depositBeginTime.trim())){
            bootbox.alert("请设置完整的定金支付结束时间。");
            return;
        }
        if(postData.depositBeginTime == postData.depositEndTime){
            bootbox.alert("定金开始时间不能和结束时间相同。");
            return;
        }

        if (postData.type != 3 && (!postData.beginTime || postData.beginTime.trim() == "")) {
            bootbox.alert("尾款支付开始时间不能为空。");
            return;
        }
        if(postData.type != 3 && (!reg.test(postData.beginTime.trim()))){
            bootbox.alert("请设置完整的尾款支付开始时间。");
            return;
        }

        if (postData.type != 3 && (!postData.endTime || postData.endTime.trim() == "")) {
            bootbox.alert("尾款支付结束时间不能为空。");
            return;
        }
        if(postData.type != 3 && (!reg.test(postData.endTime.trim()))){
            bootbox.alert("请设置完整的尾款支付结束时间。");
            return;
        }
        if(postData.type != 3 && postData.beginTime == postData.endTime){
            bootbox.alert("尾款开始时间不能和结束时间相同。");
            return;
        }

        if (!postData.stockingTime || postData.stockingTime.trim() === "") {
            bootbox.alert("开始对接时间不能为空。");
            return;
        }
        if(!reg.test(postData.stockingTime.trim())){
            bootbox.alert("请设置完整的开始对接时间。");
            return;
        }

        if (!postData.deliveryBeginTime || postData.deliveryBeginTime.trim() === "") {
            bootbox.alert("开始发货时间不能为空。");
            return;
        }
        if(!reg.test(postData.deliveryBeginTime.trim())){
            bootbox.alert("请设置完整的开始发货时间。");
            return;
        }

        if (!postData.deliveryEndTime || postData.deliveryEndTime.trim() === "") {
            bootbox.alert("结束发货时间不能为空。");
            return;
        }
        if(!reg.test(postData.deliveryEndTime.trim())){
            bootbox.alert("请设置完整的结束发货时间。");
            return;
        }
        if (!postData.deposit || postData.deposit == "") {
            bootbox.alert("定金不能为空。");
            return;
        }
        if (isNaN(postData.deposit)) {
            bootbox.alert("定金必须是数字。");
            return;
        }
        //按人数设置价格
        if (type == "2") {
            if (scopeArray == null || scopeArray.length == 0) {
                bootbox.alert("请设置预售价范围。");
                return;
            }
            for (var i = 0; i < scopeArray.length; i++) {
                var scope = scopeArray[i];
                var begin = scope.begin();
                var end = scope.end();
                var scopeBalance = scope.scopeBalance();
                var scopeTotalPrice = scope.scopeTotalPrice();
                var totalPrice = accAdd(scopeBalance, postData.deposit);
                if (totalPrice != scopeTotalPrice) {
                    bootbox.alert("预售价不等于定金+尾款。");
                    return;
                }
                if (isNaN(begin) || isNaN(end) || isNaN(scopeBalance) || isNaN(scopeTotalPrice)) {
                    bootbox.alert("预售价范围格式填写错误。");
                    return;
                }
                if (!end) {
                    bootbox.alert("预定人数不能为空。");
                    return;
                }
                if (!scopeTotalPrice) {
                    bootbox.alert("预售价不能为空。");
                    return;
                }
                if (!scopeBalance) {
                    bootbox.alert("尾款不能为空。");
                    return;
                }
                if (parseInt(begin) > parseInt(end) && parseInt(end) != -1) {
                    bootbox.alert("预售价范围设置错误,开始人数不能大于结束人数。");
                    return;
                }
                scope.begin(parseInt(begin));
                scope.end(parseInt(end));
                scope.scopeBalance(parseFloat(scopeBalance).toFixed(2));
                scope.scopeTotalPrice(parseFloat(scopeTotalPrice).toFixed(2));
                for (var j = i; j < scopeArray.length; j++) {
                    var scope2 = scopeArray[j];
                    var begin2 = scope2.begin();
                    var end2 = scope2.end();
                    if (parseInt(begin2) > parseInt(begin) && parseInt(begin2) < parseInt(end)) {
                        bootbox.alert("预售价范围不能冲突。");
                        return;
                    }
                    if (parseInt(end2) < parseInt(end) && parseInt(end2) > parseInt(begin)) {
                        bootbox.alert("预售价范围不能冲突。");
                        return;
                    }
                }
            }
        } else {
            if (!postData.totalPrice || postData.totalPrice == "") {
                bootbox.alert("预售价不能为空。");
                return;
            }
            if (isNaN(postData.totalPrice)) {
                bootbox.alert("预售价必须是数字。");
                return;
            }
            if (type == "1") {
                if (!postData.balance || postData.balance == "") {
                    bootbox.alert("尾款不能为空。");
                    return;
                }
                if (isNaN(postData.balance)) {
                    bootbox.alert("尾款必须是数字。");
                    return;
                }
            }
            var totalAmount = parseFloat(postData.totalPrice).toFixed(2);
            var balanceAmount = parseFloat(postData.balance).toFixed(2);
            var depositAmount = parseFloat(postData.deposit).toFixed(2);
            if (totalAmount != (parseFloat(balanceAmount) + parseFloat(depositAmount))) {
                bootbox.alert("预售价不等于定金+尾款。");
                return;
            }
            postData.totalPrice = totalAmount;
            postData.balance = balanceAmount;
            postData.deposit = depositAmount;
        }
        if (!postData.items || postData.items.length == 0) {
            bootbox.alert("商品不能为空。");
            return;
        }
        postData.products = null;
        $.post("handler/preSale_rule_add_handler.jsx", {m: m, appStr: JSON.stringify(postData)}, function (ret) {
            if (ret.state == 'ok') {
                bootbox.alert("保存成功。", function () {
                    window.location.href = "preSale_rule_list.jsx?m=" + m;
                });
                self.setData();
            }
            else {
                bootbox.alert("保存失败！" + ret.msg);
            }
        }, "JSON")
    };
    self.reset = function () {
        self.setData({});
    };
    self.changePrice = function () {
        if (scopeArray) {
            for (var j = 0; j < scopeArray.length; j++) {
                var scope2 = scopeArray[j];
                scope2.priceChange();
            }
        }
        var deposit = $("#deposit").val();
        var totalPrice = $("#totalPrice").val();
        if (totalPrice && deposit) {
            self.balance(Subtr(parseFloat(totalPrice), parseFloat(deposit)));
        }
        var type = self.type();
        if (type == "3") {
            self.deposit(totalPrice);
            self.balance(0);
        }
    };
    self.setData(configs);
}

function ScopePage(config) {
    var self = this;
    self.begin = ko.observable(config.begin || "0");
    self.end = ko.observable(config.end || "");
    self.scopeBalance = ko.observable(config.scopeBalance || "");
    self.scopeTotalPrice = ko.observable(config.scopeTotalPrice || "");

    self.setData = function (data) {
        data = data || {};
        self.begin(data.begin || "");
        self.end(data.end || "");
        self.scopeBalance(data.scopeBalance || "");
        self.scopeTotalPrice(data.scopeTotalPrice || "");

    };
    self.getData = function () {
        var data = {};
        data.begin = self.begin();
        data.end = self.end();
        data.scopeBalance = self.scopeBalance();
        data.scopeTotalPrice = self.scopeTotalPrice();
        if (data.begin) {
            data.begin = parseInt(data.begin);
        }
        if (data.end) {
            data.end = parseInt(data.end);
        }
        if (data.scopeBalance) {
            data.scopeBalance = parseFloat(data.scopeBalance).toFixed(2);
        }
        if (data.scopeTotalPrice) {
            data.scopeTotalPrice = parseFloat(data.scopeTotalPrice).toFixed(2);
        }
        return data;
    };
    self.priceChange = function () {
        var deposit = $("#deposit").val();
        if (deposit) {
            var totalPrice = self.scopeTotalPrice();
            if (totalPrice) {
                if (parseFloat(deposit) > parseFloat(totalPrice)) {
                    bootbox.alert("预售价" + totalPrice + "不能小于定金" + deposit + "。");
                    return;
                }
                self.scopeBalance(Subtr(parseFloat(totalPrice), parseFloat(deposit)));
            }
        }
    };
};
var scopeArray = new Array();
var preSaleRuleAddPage = null;
$(document).ready(function () {
    var data = {};
    preSaleRuleAddPage = new PreSaleRuleAddPage(data);
    ko.applyBindings(preSaleRuleAddPage, document.getElementById("preSaleRuleAddPage"));

    var count = 0;
    var $sections = $(".sections");
    $(".addContent").click(function () {
        addContent();
    });

    //增加一个尾款范围
    function addContent() {
        if (count == 3) {
            bootbox.alert("最多只能添加三个范围!");
            return;
        }
        var data = {};
        var prvObj = undefined;
        if (scopeArray.length > 0) {
            prvObj = scopeArray[(count - 1)];
            data.begin = prvObj.end();
        }
        var section = $("#template").children(".section").clone();
        section.attr("pres-index", count);
        var id = "pres_" + count++;
        section.attr("id", id);
        section.appendTo($sections);
        var presObj = new ScopePage(data);
        scopeArray.push(presObj);
        ko.applyBindings(presObj, document.getElementById(id));
    }

    $(".deleteContent").click(function () {
        if ($sections.children(".section").length == 1) return;
        $(".sections .section:last").remove();
        scopeArray.pop();
        count--;
    });
});
