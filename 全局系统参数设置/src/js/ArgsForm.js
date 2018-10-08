$(document).ready(function () {
    $("#submit_form").click(function () {
        var lotteryUrl = $("#lotteryUrl").val();
        var otoEntityMerchantIds = $("#otoEntityMerchantIds").val();
        var jigsawBgImages = $("#jigsawBgImages").val();
        var jigsawAccess_token = $("#jigsawAccess_token").val();
        var postData = {
            lotteryUrl: lotteryUrl,
            otoEntityMerchantIds: otoEntityMerchantIds,
            jigsawBgImages: jigsawBgImages,
            jigsawAccess_token: jigsawAccess_token
        };

        $.post("ArgsForm_handler.jsx", postData, function (data) {
            if (data.code == 'ok') {
                alert("保存成功");
            } else {
                alert(data.msg);
            }
        }, "json");
    });
});



