var pagination = null;
$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_applicationManage.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    pagination = new $.IsoneAjaxPagination(initconfig);
    var activeId = $("#activeId").val();
    pagination.load({activeId: activeId});
    var data = {
        activeId: activeId,
        m: m
    };
    $.post("../handler/getProductList.jsx", data, function (res) {
        var objSelect = document.getElementById("selectL");
        var objSelectA = document.getElementById("selectA");
        for (var i = 0; i < res.productList.length; i++) {
            objSelect.options.add(new Option(res.productList[i].name, res.productList[i].id));
            objSelectA.options.add(new Option(res.productList[i].name, res.productList[i].productObjId));
        }
    }, "json");

    $.post("../handler/getActiveNameId.jsx", data, function (res) {
        var objSelect = document.getElementById("selectAi");
        for (var i = 0; i < res.length; i++) {
            objSelect.options.add(new Option(res[i].title, res[i].id));
        }
    }, "json");
    $("#search").bind("click", function () {
        search();
    });
    $("#export").bind("click", function () {
        var productId = $("#selectL option:selected").val();
        var state = $("#state option:selected").val();
        var exportName = $("#exportName").val();
        var activeId = $("#activeId").val();
        var data = {
            productId: productId,
            state: state,
            activeId: activeId,
            fileName: exportName,
            m: m
        };
        $.post("../handler/export_Application.jsx", data, function (res) {
            if (res.param == "ok") {
                $("#getHistory").click();
            }
        }, "json");
    });

    $(".blackExport").bind("click", function () {
        var activeId = $("#selectAi option:selected").val();
        var fileName = $("#fileName1").val();
        $.post("../handler/blackExport.jsx", {activeId: activeId, fileName: fileName, m: m}, function (res) {
            if (res.state == "ok") {
                $("#blackList").attr("aria-hidden", "true");
                $("#blackDown").click();
            }
        }, "json");
    });

    function down(name) {
        $.get("../handler/getHistory.jsx?m=" + m + "&listName=" + name, function (res) {
            var html = "";
            for (var b = 0; b < res.histories.length; b++) {
                var oneData = res.histories[b];
                html += '<tr>'
                    + '<td>' + oneData.fileName + '</td>'
                    + '<td>' + (new Date(Number(oneData.createTime))).toLocaleString() + '</td>'
                    + '<td><a href=' + oneData.url + '>下载</a></td>'
                    + '</tr>';
            }
            $("#historyList").html(html);
        }, "json")
    }

    $("#getHistory").bind("click", function () {//申请名单下载
        var name = "applicationProductExport";
        down(name);
    });
    $("#successList").bind("click", function () {//中奖名单下载
        var name = "successUserExport";
        down(name);
    });
    $("#blackDown").bind("click", function () {//黑名单下载
        var name = "application_black_list";
        down(name);
    });
    $("#qualificationsUp").bind("click", function () {
        var number = $("#Number").val();
        var condition1 = false;
        var condition2 = false;
        var condition3 = false;
        var successNum = 0;
        var productId = $("#selectA option:selected").val();
        if ($("#condition1").get(0).checked) {
            condition1 = true;
        }
        if ($("#condition2").get(0).checked) {
            condition2 = true;
            successNum = $("#successNum").val();
        }
        if ($("#condition3").get(0).checked) {
            condition3 = true;
        }
        var activeId = $("#activeId").val();
        var data = {
            condition1: condition1,
            condition2: condition2,
            condition3: condition3,
            number: number,
            productId: productId,
            successNum: successNum,
            activeId: activeId,
            fileName: $("#fileName").val(),
            m: m
        };
        $.post("../handler/exportSuccessUser.jsx", data, function (res) {
            if (res.param == "ok") {
                $("#qualificationsTable").attr("aria-hidden", "true");
                $("#successList").click();
            }
        }, "json");
    });
});

function search() {
    var productId = $("#selectL option:selected").val();
    var state = $("#state option:selected").val();
    var activeId = $("#activeId").val();
    var searchArgs = {};
    if (productId != "") {
        searchArgs.productId = productId;
        searchArgs.activeId = activeId;
        searchArgs.state = state;
    }
    pagination.load(searchArgs);
}