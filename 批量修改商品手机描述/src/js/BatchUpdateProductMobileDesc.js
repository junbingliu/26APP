$(document).ready(function () {
    var $submit_form = $("#submit_form");
    $submit_form.removeAttr("disabled");
    $submit_form.bind("click", function () {
        if ($("#importFileId").val() == "") {
            alert("请先选择并上传待批量修改的Excel文件");
            return false;
        }

        if ($("#descImagePath").val() == "") {
            alert("商品图片所在服务器地址不能为空");
            return false;
        }

        var isDo = confirm("确定要开始批量修改吗");
        if (isDo) {
            var $submit_form = $("#submit_form");
            $submit_form.html("正在处理中...");
            $submit_form.attr("disabled", "disabled");
            $("#importDataForm").submit();

            var infoLayer = $.layer({
                shade: [0],
                area: ['auto', 'auto'],
                dialog: {
                    msg: '商品描述批量修改正在后台处理中，请稍后查看修改日志了解修改结果',
                    btns: 2,
                    type: 4,
                    btn: ['查看日志', '关闭'],
                    yes: function () {
                        window.location.href = "LogView.jsx?m=" + merchantId;
                    },
                    no: function () {
                        layer.close(infoLayer);
                        $submit_form.html("开始批量修改");
                        $submit_form.removeAttr("disabled");
                    }
                }
            });
        }
    });

    $(".findImageType").bind("click", function () {
        var $this = $(this);
        $(".findTypeName").html($this.attr("data-a"));

    });
});




