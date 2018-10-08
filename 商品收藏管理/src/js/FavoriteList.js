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

});
