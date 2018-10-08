var globalSetMerchantId;
$(document).ready(function () {

    var initconfig = {
        bsV: "3",
        ajaxUrl: "load_record_lotteryLog.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId, id: id/*,eventId:eventId,activityGrade:activityGrade*/});

    var $body = $("body");
    var $record_list = $("#record_list");
    $record_list.on('click', ".doUpdateState", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");

        $('#doUpdateStateModal').modal('show');
    });

    $body.on('click', "#cancelStateBtn", function () {
        $('#doUpdateStateModal').modal('hide');
    });

    //============================================================================================================================================
    //查看抽奖日志按钮
    $body.on('click', "#search", function () {
        var keyword = $.trim($("#keyword").val());
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        searchArgs.m = merchantId;
        pagination.load(searchArgs);
    });

    /**
     * 导出抽奖日志按钮
     */
    $body.on('click', "#export_btn", function () {
        $("#myModal_lotteryLog").modal("show");
    });

    /**
     * 查看中奖日志按钮
     */
    $body.on('click', "#winningLog_btn", function () {
        var keyword = "等奖";
        var searchArgs = {};
        if (keyword != "") {
            searchArgs.keyword = keyword;
        }
        searchArgs.m = merchantId;
        pagination.load(searchArgs);
    });

    /**
     * 点开兑换按钮
     */

    $body.on('click', "#awards_btn", function () {
        //先获取，再修改//TODO
        var $this = $(this);
        var lotteryId = $this.attr("data-a");
        $.post("tools/getLotteryLog.jsx", {lotteryId: lotteryId}, function (data) {
            var lottery = eval('(' + data + ')');
            if (confirm("                                  你确定兑换吗？")) {
                lottery.status = 2;
                status = lottery.status;
                $.post("tools/updateLotteryLog.jsx", {lotteryId: lotteryId, status: status}, function (data) {
                    if (data.code != "0") {
                        alert("                                 兑换成功");
                        pagination.load(null);
                    } else {
                        alert("                                 兑换不成功");
                        pagination.load(null);
                    }
                })
            } else {

            }

        })

    });

    /*
        导出确认按钮
     */
    $body.on('click', "#yes_btn", function () {
        var activity = $("#activity_at").val();
        var fileName = $("#fileName").val();
        $.post("tools/export_lotteryLog.jsx", {m: merchantId, activity: activity, fileName: fileName}, function (data) {
            var json = eval("(" + data + ")");
            if (json.state == "ok") {
                alert(json.msg + "　您可以在【导出历史】中查看并下载。");
            } else {
                alert(json.msg);
            }
        });
    });

    $("#excelListHistory_btn").bind("click", function () {

        $.ajax({
                url: "tools/getHistory_lotteryLog.jsx?m=" + merchantId,
                type: "post",
                dataType: "json",
                success: function (data) {
                    var divShow = $("#excelListHistoryDiv tbody");
                    divShow.html("");
                    var html = "";
                    for (var i = 0; i < data.length; i++) {
                        html += '<tr>'
                            + '<td>' + data[i].fileName + '</td>'
                            + '<td><a href=' + data[i].url + '>下载</a></td>'
                            + '</tr>'
                    }
                    divShow.append(html);
                }
            }
        );
    });

    /*
        删除
     */
    $body.on('click', "#del_btn", function () {
        var $this = $(this);
        globalSetMerchantId = $this.attr("data-a");
        var postData = {};
        postData.id = globalSetMerchantId;
        $.post("tools/lotteryDelete.jsx", postData, function (data) {
            if (data.code == "0") {
                alert(data.msg);
                pagination.load(null);
            } else {
                alert(data.msg);
            }
        }, "json");
    });
});
