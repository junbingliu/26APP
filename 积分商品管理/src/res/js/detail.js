var UPDATE_RULE_URL = "handler/update_rule.jsx";
$(document).ready(function () {
    $(".save").on("click", function () {
        var data = $("form").serializeObject();
        $.post(UPDATE_RULE_URL, {
            "data": JSON.stringify(data),
            "merchantId": merchantId
        }, function (ret) {
            if (ret.code === "0") {
                // bootbox.alert("操作成功");
                window.parent.loadData();
                var index = window.parent.layer.getFrameIndex(window.name);
                window.parent.layer.close(index);
            } else {
                bootbox.alert("操作失败：" + ret.msg);
            }
        }, "JSON");
    });
});

$.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
