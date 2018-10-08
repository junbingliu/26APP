$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_favorite.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});
    var $body = $("body");
    var $record_list = $("#record_list");
    $record_list.on('click', ".doDeleteMerchant", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");
        $('#deleteFavorMerchantModal').modal('show');
    });
    $body.on('click', "#delFavorMerchantBtn", function () {
        var postData = {};
        postData.m = merchantId;
        postData.id = globalSetMerchantId;
        $.post("deleteFavoriteMerchant.jsx", postData, function (data) {
            if(data.code == "0"){
                $('#deleteFavorMerchantModal').modal('hide');
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");
    });

});
