var pagination;
$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        paginationId: "p1",
        ajaxUrl: "load_list.jsx",
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

    $('#reSendAll').click(function () {
        var chk_value = [];
        $('input[name="subcheck"]:checked').each(function () {
            chk_value.push($(this).val());
        });
        if (chk_value.length == 0) {
            alert("你还没有选择任何数据！");
        } else {
            var ids = chk_value.join(",");
            $.post("handler/reSendSku.jsx", {productIds: ids}, function (result) {
                if (result.state == "ok") {
                    alert("重发成功!");
                    if(typeof loadData == "function"){
                        loadData();
                    }
                } else {
                    alert("重发失败!");
                }
            }, "JSON");
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