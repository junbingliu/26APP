$(document).ready(function () {
    $("#submit_form").click(function () {
        var appSecret = $("#appSecret").val();
        var getMemberByOpenIdUrl = $("#getMemberByOpenIdUrl").val();
        var getCodeByOpenIdUrl = $("#getCodeByOpenIdUrl").val();
        var toActOauthUrl = $("#toActOauthUrl").val();
        var oleAppSecret = $("#oleAppSecret").val();
        var oleToActOauthUrl = $("#oleToActOauthUrl").val();

        var postData = {
            appSecret: appSecret,
            getMemberByOpenIdUrl: getMemberByOpenIdUrl,
            getCodeByOpenIdUrl: getCodeByOpenIdUrl,
            toActOauthUrl: toActOauthUrl,
            oleAppSecret: oleAppSecret,
            oleToActOauthUrl: oleToActOauthUrl,
            m: merchantId
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



