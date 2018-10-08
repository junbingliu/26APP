$(document).ready(function () {
    var $submit_form = $("#submit_form");
    $submit_form.removeAttr("disabled");
    $submit_form.bind("click", function () {
        if ($("#importFileId").val() == "") {
            alert("请先选择并上传Excel文件");
            return false;
        }

        var isDo = confirm("确定要开始批量处理吗");
        if (isDo) {
            var $submit_form = $("#submit_form");
            $submit_form.html("正在导入...");
            $submit_form.attr("disabled", "disabled");
            $("#importDataForm").submit();

            var infoLayer = $.layer({
                shade: [0],
                area: ['auto', 'auto'],
                dialog: {
                    msg: '账号合并正在后台处理中，请稍后查看日志了解处理结果',
                    btns: 2,
                    type: 4,
                    btn: ['查看日志', '关闭'],
                    yes: function () {
                        window.location.href = "LogView.jsx?m=" + merchantId;
                    },
                    no: function () {
                        layer.close(infoLayer);
                        $submit_form.html("开始导入");
                        $submit_form.removeAttr("disabled");
                    }
                }
            });
        }
    });

});




