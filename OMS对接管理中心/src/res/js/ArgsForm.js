$(document).ready(function () {
    $("#submit_form").click(function () {
        var isOmsExchange = $('input[name="isOmsExchange"]:checked ');
        var isEsbExchange = $('input[name="isEsbExchange"]:checked ');
        var isEsbExchange = $('input[name="isEsbExchange"]:checked ');
        var omsEsbUrl = $('input[name="omsEsbUrl"] ');
        var beginTime = $('#beginTime ');

        var postData = {
            m: merchantId,
            isOmsExchange: isOmsExchange && isOmsExchange.val() || "N",
            isEsbExchange: isEsbExchange && isEsbExchange.val() || "N",
            beginTime: beginTime.val() || "",
            omsEsbUrl: omsEsbUrl.val() || ""
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



