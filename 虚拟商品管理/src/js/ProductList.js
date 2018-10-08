var globalProductId;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_product.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});

    var $body = $("body");
    var $record_list = $("#record_list");
    $record_list.on('click', ".doUpdateProduct", function () {
        var $this = $(this);
        globalProductId = $this.attr("data-a");

        $('#doUpdateModal').modal('show');
    });

    $body.on('click', "#cancelBtn", function () {
        $('#doUpdateModal').modal('hide');
    });

    $body.on('click', "#search", function () {
        var keyword = $.trim($("#keyword").val());
        var cardBatchId = $.trim($("#cardBatchId").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        if (cardBatchId != "") {
            searchArgs.cardBatchId = cardBatchId;
        }
        searchArgs.m = merchantId;

        pagination.load(searchArgs);
    });

    //修改价格
    $body.on('click', ".editBtn", function () {

        var productId = $(this).data("id");
        var pageData = {
            id: productId,
            m: merchantId
        };
        $.post("editProduct.jsx", pageData, function (backData) {
            $("#doEditDiv").html(backData);
        });

        $("#doUpdateProduct").modal("show");
    });

    //保存价格修改
    $body.on('click', "#saveBtn", function () {

        var id = $(this).data("a");
        var memberPrice = $("#memberPrice").val();
        var marketPrice = $("#marketPrice").val();
        var realAmount = $("#realAmount").val();

        var reg = /^(([0-9]+)|([0-9]+\.[0-9]{1,2}))$/;
        if (!reg.test(memberPrice) || !reg.test(marketPrice)) {
            alert("价格格式有误, 请输入正整数或保留1到2位小数");
            return;
        }
        var reg2 = /^[+]{0,1}(\d+)$/;
        if (!reg2.test(realAmount)) {
            alert("库存只能是正整数");
            return;
        }
        var newData = {
            id: id,
            merchantId: merchantId,
            memberPrice: memberPrice,
            marketPrice: marketPrice,
            realAmount: realAmount
        };

        $.post("edit.jsx", newData, function (data) {
            if (data.code != "0") {
                alert(data.msg);
                return;
            }
            pagination.load(null);
            $("#doUpdateProduct").modal("hide");
        }, "json")


    });


    $body.on('click', "#downShelf", function () {
        var productId = $(this).data("id");
        var status = $(this).data("a");
        upOrDownShelf(status, productId);
    });

    $body.on('click', "#onShelf", function () {
        var productId = $(this).data("id");
        var status = $(this).data("a");
        upOrDownShelf(status, productId);
    });

    //上下架方法抽取
    function upOrDownShelf(publishState, productId) {
        var handle = publishState == "1" ? "上架" : "下架";
        if (confirm("确定要" + handle + "该商品吗?")) {
            $.post("upAndDownShelf.jsx", {
                productId: productId,
                publishState: publishState,
                m: merchantId
            }, function (data) {
                if (data.code != "0") {
                    alert(data.msg);
                    return;
                }
                pagination.load(null);

            }, "json")
        }
    }

});
