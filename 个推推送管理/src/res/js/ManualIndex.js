$(document).ready(function () {
    $("#doReSendOrderByConfirm").click(function () {
        doReSendOrderByConfirm();
    });
});

function doReSendOrderByConfirm() {
    var orderId = $("#orderId");
    var $type = $("input[name='type']:checked");
    var postData = {
        orderId: orderId.val(),
        type: $type.val()
    };

    if (!confirm("是否确定要这样操作？")) {
        return;
    }

    $.post("handler/send.jsx", postData, function (data) {
        if (data.state == 'ok') {
            alert("操作成功");
            $("#msg").html("返回结果："+JSON.stringify(data.msg));
        } else {
            alert(data.msg);
        }
    }, "json");
}





