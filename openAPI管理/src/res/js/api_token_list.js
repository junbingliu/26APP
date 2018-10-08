$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        paginationId: "p1",
        ajaxUrl: "load_api_token.jsx",
        data_container: "#record_list",
        pagination_container: "#pagination",
        pagination_params: "#pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({});

    var loadData = function () {
        var token = $.trim($("#token").val());
        var channel = $.trim($("#channel").val());
        var sys = $.trim($("#sys").val());
        var searchArgs = {};
        if (token) {
            searchArgs.token = token;
        }
        if (channel) {
            searchArgs.channel = channel;
        }
        if (sys) {
            searchArgs.sys = sys;
        }
        //var data = $("#apiTokenSearchForm").serialize();
        //var d={};$(form).find('input,select').each(function(){d[this.name]=this.value});console.log(d);
        var t = $('#apiTokenSearchForm').serializeArray();
        var data = {};
        $.each(t, function () {
            data[this.name] = this.value;
        });
        pagination.load(data);
    };
    $("#search").on("click", function () {
        loadData();
    });
    $("#api_id").on("keydown", function (event) {
        if (event.keyCode == '13') {
            loadData();
        }
    });
    $("#api_name").on("keydown", function (event) {
        if (event.keyCode == '13') {
            loadData();
        }
    });
});

function reloadList() {
    window.location.reload();
}