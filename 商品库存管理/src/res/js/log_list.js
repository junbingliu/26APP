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
    $('#keyword').keydown(function (e) {
        if (e.keyCode == 13) {
            loadData();
            return false;
        }
    });
});
function loadData() {
    var keyword = $.trim($("#keyword").val());
    var beginCreateTime = $.trim($("#beginCreateTime").val());
    var endCreateTime = $.trim($("#endCreateTime").val());
    var merchantId = $.trim($("#merchantId").val());
    var searchArgs = {};
    if (keyword != "") {
        searchArgs.keyword = keyword;
    }
    if (beginCreateTime != "") {
        searchArgs.beginCreateTime = beginCreateTime;
    }
    if (endCreateTime != "") {
        searchArgs.endCreateTime = endCreateTime;
    }
    if (merchantId != "") {
        searchArgs.m = merchantId;
    }
    pagination.load(searchArgs);
}

function reloadList() {
    window.location.reload();
}