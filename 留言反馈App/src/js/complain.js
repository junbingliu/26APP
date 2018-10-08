var globalSetId;
$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_complain.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var merchantId = $("#merchantId").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m:merchantId});
    var $body = $("body");
    $("#search").bind("click", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        pagination.load(searchArgs);
    });
    $body.on('click', "#delBtnClick", function () {
        var $this = $(this);
        globalSetId=$this.attr("data-a");
        console.log("=======globalSetId=====",globalSetId);
        $('#deleteModelPanle').modal('show');
    });
    $body.on('click', "#confirmDelete", function () {
        $.post("../handler/deleteComlaint.jsx",{id:globalSetId},function (ret) {
            $('#deleteModelPanle').modal('hide');
            pagination.load({});
        },'json')

    });
});
