$(document).ready(function () {
    var $submit_form = $("#submit_form");
    $submit_form.removeAttr("disabled");
    $submit_form.bind("click", function () {
        if ($("#importFileId").val() == "") {
            alert("请先选择并上传待上传商品图片Excel文件");
            return false;
        }

        if ($("#imagePath").val() == "") {
            alert("商品图片所在服务器地址不能为空");
            return false;
        }

        var isDo = confirm("确定要开始导入吗");
        if (isDo) {
            var $submit_form = $("#submit_form");
            $submit_form.html("正在导入...");
            $submit_form.attr("disabled", "disabled");
            $("#importDataForm").submit();

            var infoLayer = $.layer({
                shade: [0],
                area: ['auto', 'auto'],
                dialog: {
                    msg: '商品图片导入正在后台处理中，请稍后查看导入日志了解导入结果',
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
    $(".findImageType").bind("click", function () {
        var $this = $(this);
        $(".findTypeName").html($this.attr("data-a"));

    });
});




