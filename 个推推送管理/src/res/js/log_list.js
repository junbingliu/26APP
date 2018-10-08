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
    pagination.load({type: logType, m: m});

    $("#search").bind("click", function () {
        search();
    });

    $('#keyword').keydown(function (e) {
        if (e.keyCode == 13) {
            search();
            return false;
        }
    });
    var search = function () {
        var logType = $.trim($("#logType").val());
        var isSuccess = $.trim($("#isSuccess").val());
        var keyword = $.trim($("#keyword").val());
        var beginCreateTime = $.trim($("#beginCreateTime").val());
        var endCreateTime = $.trim($("#endCreateTime").val());
        var searchArgs = {};
        if (logType != "") {
            searchArgs.type = logType;
        }
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        if (isSuccess != "") {
            searchArgs.isSuccess = isSuccess;
        }
        if (beginCreateTime != "") {
            searchArgs.beginCreateTime = beginCreateTime;
        }
        if (endCreateTime != "") {
            searchArgs.endCreateTime = endCreateTime;
        }
        searchArgs.m = m;
        pagination.load(searchArgs);
    };

    $("#upload_file_smt").bind("click", function () {
        $(this).button('loading');

        var logType = $.trim($("#logType").val());
        var isSuccess = $.trim($("#isSuccess").val());
        var keyword = $.trim($("#keyword").val());
        var beginCreateTime = $.trim($("#beginCreateTime").val());
        var endCreateTime = $.trim($("#endCreateTime").val());
        var export_fileName = $("#export_fileName").val();

        var postData = {
            logType: logType,
            keyword: keyword,
            isSuccess: isSuccess,
            beginCreateTime: beginCreateTime,
            endCreateTime: endCreateTime,
            export_fileName: export_fileName,
            m: m
        };
        $.post("handler/export.jsx", postData, function (data) {
            if (data.state == "ok") {
                bootbox.alert(data.msg + "　您可以在【导出历史】中查看并下载。");
            } else {
                bootbox.alert(data.msg);
            }
            $('#upload_file_smt').button('reset');
        }, "json");
    });

    $("#excelListHistory").bind("click", function () {
        $.ajax({
                url: "load_export_histories.jsx",
                data: {t: "hrt_log", m: m},
                type: "post",
                success: function (data) {
                    var divShow = $("#excelListHistoryDiv");
                    divShow.html(data);
                }
            }
        );
    });

});
