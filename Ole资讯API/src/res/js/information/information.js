$(document).ready(function () {
        /**
         * 资讯设置_重置按钮
         */
        $(".info-reset").on("click", function () {
            $("#infoColumnId").val(""); // 资讯分类总ID
        });

        /**
         * 资讯设置_保存按钮
         */
        $(".info-save").on("click", function () {
            var infoColumnId = $("#infoColumnId").val(); // 资讯分类总ID

            if (!infoColumnId) {
                alert("资讯分类总ID不能为空");
                return;
            }

            var settingObject = {
                "infoColumnId": infoColumnId
            };

            $.post("../../handler/informationHandler.jsx", {data: JSON.stringify(settingObject)}, function (ret) {
                if (ret.code === "S0A00000") {
                    alert("保存成功");
                } else {
                    alert("保存失败！" + ret.msg);
                }
            });
        });
    }
);
