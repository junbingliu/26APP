$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        paginationId: "p1",
        ajaxUrl: "load_api.jsx",
        data_container: "#record_list",
        pagination_container: "#pagination",
        pagination_params: "#pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({});

    window.loadData = function () {
        var api_id = $.trim($("#api_id").val());
        var api_name = $.trim($("#api_name").val());
        var searchArgs = {};
        if (api_id) {
            searchArgs.api_id = api_id;
        }
        if (api_name) {
            searchArgs.api_name = api_name;
        }
        pagination.load(searchArgs);
    };
    $("#search").on("click", function () {
        loadData();
    });
    $("#api_id").on("keydown",function(event){
        if(event.keyCode == '13'){
            loadData();
        }
    });
    $("#api_name").on("keydown",function(event){
        if(event.keyCode == '13'){
            loadData();
        }
    });
});

function reloadList() {
    window.loadData();
}