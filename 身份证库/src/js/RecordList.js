var globalIdCardId;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId, t:t});

    var $body = $("body");
    var $record_list = $("#record_list");

    $body.on('click', "#search", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        searchArgs.m = merchantId;
        searchArgs.t = t;

        pagination.load(searchArgs);
    });

    $record_list.on('click', ".doUpdateState", function () {
        var $this = $(this);
        globalIdCardId = $this.attr("data-a");

        $('#doUpdateStateModal').modal('show');
    });

    $body.on('click', "#updateStateBtn", function () {
        var recordState = $("#recordState").val();
        if(recordState == "-1"){
            alert("请选择处理方式");
            return;
        }

        var postData = {};
        postData.m = merchantId;
        postData.id = globalIdCardId;
        postData.state = recordState;

        $.post("RecordUpdateState.jsx", postData, function (data) {
            if(data.code == "0"){
                $('#doUpdateStateModal').modal('hide');
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");

    });

    $body.on('click', "#cancelStateBtn", function () {
        $('#doUpdateStateModal').modal('hide');
    });


});
