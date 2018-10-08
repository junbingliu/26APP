$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_logs.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var logType = $("#logType").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({type:logType});

    $("#search").bind("click", function () {
        var logType = $.trim($("#logType").val());
        var keyword = $.trim($("#keyword").val());
        var serviceId = $.trim($("#serviceId").val());
        var serialNumber = $.trim($("#serialNumber").val());
        var searchArgs = {};
        if (logType != "") {
            searchArgs.type = logType;
        }
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        if (serviceId != "") {
            searchArgs.serviceId = serviceId;
        }
        if (serialNumber != "") {
            searchArgs.serialNumber = serialNumber;
        }
        pagination.load(searchArgs);
    });

});
