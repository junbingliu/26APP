$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_merchant.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var logType = $("#logType").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({type:logType});

    $("#search").bind("click", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        pagination.load(searchArgs);
    });

});
