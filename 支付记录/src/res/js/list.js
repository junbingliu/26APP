$(document).ready(function () {
    /*$(".updateClass").on("click",function(){
     var href = $(this).data("a");
     $.layer({
     type: 2,
     shadeClose: true,
     title: false,
     closeBtn: true,
     shade: [0.8, '#000'],
     border: [0],
     offset: ['20px', ''],
     area: ['1000px', ($(window).height() - 50) + 'px'],
     iframe: {src: href}
     });
     });*//*
    $(".updateClass").on("click", function () {
        var id = $(this).data("a");
        document.getElementById("addForm").reset();
        $.get("handler/get_by_id.jsx", {id: id}, function (result) {
            if (result.state == "ok") {
                var needPayAmount = result.data.needPayMoneyAmount && (Number(result.data.needPayMoneyAmount) /100).toFixed(2);
                $("#id").val(id);
                $("#updateOuterId").val(result.data.outerId || "");
                $("#updateNeedPayMoneyAmount").val(needPayAmount);
                $("#updatePaidMoneyAmount").val(needPayAmount);
                $("#updatePaymentName").val(result.data.paymentName || "");
                $("#myModal").modal("show");
            } else {
                bootbox.alert(result.msg);
            }
        }, "json");
    });*/
    var initconfig = {
        bsV: "3",
        paginationId: "p1",
        ajaxUrl: "load_list.jsx",
        data_container: "#record_list",
        pagination_container: "#pagination",
        pagination_params: "#pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({});

    var loadData = function () {
        var keyword = $.trim($("#keyword").val());
        var accountBeginDate = $.trim($("#accountBeginDate").val());
        var accountEndDate = $.trim($("#accountEndDate").val());
        var payInterfaceId = $.trim($("#payInterfaceId").val());
        var payState = $.trim($("#payState").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        if (accountBeginDate != "") {
            searchArgs.accountBeginDate = accountBeginDate;
        }
        if (accountEndDate != "") {
            searchArgs.accountEndDate = accountEndDate;
        }
        if (payInterfaceId != "") {
            searchArgs.payInterfaceId = payInterfaceId;
        }
        if (payState != "") {
            searchArgs.payState = payState;
        }
        pagination.load(searchArgs);
    };
    $("#search").on("click", function () {
        loadData();
    });
    $("#submitBtn").click(function () {
        var id = $("#id").val();
        var payState = $("#updatePayState").val();
        var bankSN = $("#updateBankSN").val();
        var paidMoneyAmount = $("#updatePaidMoneyAmount").val();
        //var type = $("input[name='type']:checked").val();
        if (!payState) {
            bootbox.alert("支付状态不能为空");
            return;
        }
        if (!bankSN) {
            bootbox.alert("银行流水不能为空");
            return;
        }
        if (!paidMoneyAmount || isNaN(paidMoneyAmount)) {
            bootbox.alert("已支付金额格式错误");
            return;
        }
        var postData = {
            id: id,
            payState: payState,
            transactionSn: bankSN,
            paidMoneyAmount: (Number(paidMoneyAmount) * 100).toFixed(0)
        };
        $.post("../server/updateRecord.jsx", postData, function (result) {
            if (result.state == "ok") {
                $("#myModal").modal("hide");
                bootbox.alert("修改成功",function(){
                    reloadList();
                });
            } else {
                bootbox.alert(result.msg);
            }
        }, "json");
    });
});

function reloadList() {
    window.location.reload();
}