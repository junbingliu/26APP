$(document).ready(function () {
    $("#submit_form").click(function () {
        var $merchantIds = $("#merchantIds");
        var $activityId = $("#activityId");

        var beginDate = $("#beginDate").val();
        var beginTime = $("#beginTime").val();
        var endDate = $("#endDate").val();
        var endTime = $("#endTime").val();

        if (!beginDate || beginDate == "" || !endDate || endDate == "") {
            alert("下单起止时间不能为空");
            return;
        }

        var beginDateTime = beginDate + " " + beginTime;
        var endDateTime = endDate + " " + endTime;
        var beginDateValue = new Date(Date.parse(beginDateTime.replace(/-/g, '/')));
        var endDateValue = new Date(Date.parse(endDateTime.replace(/-/g, '/')));

        var postData = {
            merchantIds: $merchantIds.val(),
            activityId: $activityId.val()
        };
        postData.beginDateTime = beginDateValue.getTime();
        postData.endDateTime = endDateValue.getTime();


        $.post("ArgsForm_handler.jsx", postData, function (data) {
            if (data.code == 'ok') {
                alert("保存成功");
            } else {
                alert(data.msg);
            }
        }, "json");
    });

    $("input.date").datepicker({
        changeYear: true
    });

    if (beginDateTime && beginDateTime != "") {
        var beginDate = new Date();
        beginDate.setTime(beginDateTime);
        $("#beginDate").val(dateFormat(beginDate, "yyyy-mm-dd"));
        $("#beginTime").val(dateFormat(beginDate, "HH:MM:ss"));
    }
    if (endDateTime && endDateTime != "") {
        var endDate = new Date();
        endDate.setTime(endDateTime);
        $("#endDate").val(dateFormat(endDate, "yyyy-mm-dd"));
        $("#endTime").val(dateFormat(endDate, "HH:MM:ss"));
    }
});



