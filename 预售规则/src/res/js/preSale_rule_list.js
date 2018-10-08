$(document).ready(function () {
    $(".deleteClass").on("click", function () {
        var id = $(this).data("a");
        $.post("handler/preSale_rule_delete_handler.jsx", {id: id}, function (ret) {
            if (ret.state == "ok") {
                bootbox.alert("删除成功", function () {
                    window.location.reload();
                });
            } else {
                bootbox.alert(ret.msg);
            }
        }, "JSON");
    });
    $(".updateClass").on("click", function () {
        var href = $(this).data("a");
        $.layer({
            type: 2,
            shadeClose: true,
            title: '修改预售规则',
            fix: false,
            maxmin: false,
            shade: [0.8, '#000'],
            offset: ['20px', ''],
            area: ['1000px', ($(window).height() - 50) + 'px'],
            iframe: {src: href},
            close: function (index) {
            }
        });
    });
    $(".approve").on("click", function () {
        var id = $(this).data("a");
        var approveState = $(this).data("b");
        $.post("handler/preSale_approve_handler.jsx", {ids: id, approveState: approveState}, function (ret) {
            if (ret.state == "ok") {
                bootbox.alert("操作成功", function () {
                    window.location.reload();
                });
            } else {
                bootbox.alert(ret.msg);
            }
        }, "JSON");
    });
    $('#approvePass').click(function () {
        var chk_value = [];
        $('input[name="subcheck"]:checked').each(function () {
            chk_value.push($(this).val());
        });
        if (chk_value.length == 0) {
            alert("你还没有选择任何数据！");
        } else {
            var btn = $(this).button('loading');
            var ids = chk_value.join(",");
            approve(ids, "1");
            btn.button('reset');
        }
    });
    $('#approveNoPass').click(function () {
        var chk_value = [];
        $('input[name="subcheck"]:checked').each(function () {
            chk_value.push($(this).val());
        });
        if (chk_value.length == 0) {
            alert("你还没有选择任何数据！");
        } else {
            var btn = $(this).button('loading');
            var ids = chk_value.join(",");
            approve(ids, "-1");
            btn.button('reset');
        }
    });
    function approve(ids, state) {
        if (!ids || !state) {
            return;
        }
        $.post("handler/preSale_approve_handler.jsx", {ids: ids, approveState: state}, function (result) {
            if (result.state == "ok") {
                bootbox.alert(result.msg, function () {
                    window.location.reload();
                });
            } else {
                bootbox.alert(result.msg);
            }
        }, "JSON");
    }

    //绑定全选的事件
    $('#checkboxAll').click(function () {
        $("input[name='subcheck']:checkbox").prop("checked", $(this).is(':checked'));
    });

    //绑定单个复选框的事件
    $('input[name="subcheck"]').click(function () {
        var $chk = $("[name = subcheck]:checkbox");
        $("#checkboxAll").prop("checked", $chk.length == $chk.filter(":checked").length);
    });
});

function reloadList() {
    window.location.reload();
}