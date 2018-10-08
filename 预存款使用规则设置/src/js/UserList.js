var globalSetUserId = "";
$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_User.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var merchantId = $("#merchantId").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});

    $("#search").bind("click", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        searchArgs.m = merchantId;
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        pagination.load(searchArgs);
    });

    var $body = $("body");
    var $record_list = $("#record_list");
    $record_list.on('click', ".doSetValidateTime", function () {
        var $this = $(this);
        globalSetUserId = $this.attr("data-a");

        $('#doSetValidateTimeModal').modal('show');
    });

    $record_list.on('click', ".doUpdateEWalletAmount", function () {
        var $this = $(this);
        globalSetUserId = $this.attr("data-a");

        var postData = {};
        postData.m = merchantId;
        postData.userId = globalSetUserId;

        $.post("GetEWalletAmount.jsx", postData, function (data) {
            if(data.code == "0"){
                $("#eWalletAmountOld").val(data.v);
                $('#doUpdateEWalletAmountModal').modal('show');
            } else {
                alert(data.msg);
            }
        }, "json");


    });

    $body.on('click', "#cancelBtn", function () {
        $('#doSetValidateTimeModal').modal('hide');
    });

    $body.on('click', "#confirmBtn", function () {
        var beginDate = $("#beginDate").val();
        var beginTime = $("#beginTime").val();
        var endDate = $.trim($("#endDate").val());
        var endTime = $.trim($("#endTime").val());

        var postData = {};
        postData.m = merchantId;
        postData.userId = globalSetUserId;
        postData.beginDate = beginDate;
        postData.beginTime = beginTime;
        postData.endDate = endDate;
        postData.endTime = endTime;

        $.post("UserUpdate.jsx", postData, function (data) {
            if(data.code == "0"){
                $('#doSetValidateTimeModal').modal('hide');
                pagination.load(null);
                alert("操作成功");
            } else {
                alert(data.msg);
            }

        }, "json");
    });

    $body.on('click', "#cancelEWalletBtn", function () {
        $('#doUpdateEWalletAmountModal').modal('hide');
    });

    $body.on('click', "#updateEWalletBtn", function () {
        var eWalletAmount = $("#eWalletAmount").val();
        var fillReason = $("#fillReason").val();

        if($.trim(eWalletAmount) == ""){
            alert("充值金额不能为空");
            return;
        }

        if($.trim(fillReason) == ""){
            alert("充值说明不能为空");
            return;
        }

        var postData = {};
        postData.m = merchantId;
        postData.userId = globalSetUserId;
        postData.eWalletAmount = eWalletAmount;
        postData.fillReason = fillReason;

        $.post("UpdateEWalletAmount.jsx", postData, function (data) {
            if(data.code == "0"){
                $('#doUpdateEWalletAmountModal').modal('hide');
                pagination.load(null);
                alert("操作成功");
            } else {
                alert(data.msg);
            }

        }, "json");
    });

    $("input.date").datepicker({
        changeYear: false
    });

});
