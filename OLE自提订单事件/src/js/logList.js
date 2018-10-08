$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_logs.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m:merchantId,t:logType});

    $("#search").bind("click", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        pagination.load(searchArgs);
    });

});
