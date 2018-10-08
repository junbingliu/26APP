var pagination;
$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        paginationId: "p1",
        ajaxUrl: "load_log.jsx",
        data_container: "#record_list",
        pagination_container: "#pagination",
        pagination_params: "#pagination_params"
    };
    pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({
        m: $.trim($("#merchantId").val())
    });
    $("#search").on("click", function () {
        loadData();
    });
});
function loadData() {
    pagination.load({
        m: $.trim($("#merchantId").val())
    });
}

function reloadList() {
    window.location.reload();
}