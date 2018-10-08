$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "loadPushManagement.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var merchantId = $("#merchantId").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});
    // var pushTarget_value = "";
    // var toTriggerState_value = "";
    // var pushServer_value = "";
    // var pushContentSetUp_value = "";
    // var pushStatement_value = "";
    $("#pushTarget").change(function () {//推送对象:0【线下课堂活动】,1【视频教学】
        pushTarget_value = $("#pushTarget option:selected").attr("value");
        $("#toTriggerState").val("");
        $("#toTriggerState option").removeAttr("disabled").css("background-color", "");
        if (pushTarget_value == "1" || pushTarget_value == 1) {//去选视频教学的
            $("#toTriggerState .underLine").attr("disabled", "disabled").css("background-color", "#ded8d8");
        } else {
            $("#toTriggerState .onLine").attr("disabled", "disabled").css("background-color", "#ded8d8");
        }
    })
    // $("#toTriggerState").change(function () {//触发状态:0【开放报名提醒】,1【取消截止提醒】,2【即将开课提醒】，3【报名成功提醒】，4【取消报名提醒】，5【视频教学暂无状态】
    //     toTriggerState_value = $("#toTriggerState option:selected").attr("value");
    // })
    // $("#pushServer").change(function () {//推送渠道:0【APP推送】,1【公众号推送】,2【站内信推送】
    //     pushServer_value = $("#pushServer option:selected").attr("value");
    // })
    // $("#pushContentSetUp").change(function () {//推送内容选择:0【文字编辑】,1【跳转落地配置】
    //     pushContentSetUp_value = $("#pushContentSetUp option:selected").attr("value");
    // })
    // $("#pushStatement").change(function () {//推送状态：0【启动】,1【暂停】
    //     pushStatement_value = $("#pushStatement option:selected").attr("value");
    // });
    $("#toCreateBtn").click(function () {//新增
        var applyData = getPostData("addNewPushManagementForm");
        if (!applyData || applyData == "" || applyData == undefined || applyData == null) {
            alert("代码元素id出错");
            return;
        }
        $.post("addNewPushManagement.jsx?m=" + merchantId, applyData, function (ret) {
            var ret = JSON.parse(ret);
            if (ret && ret.RETURN_CODE && ret.RETURN_CODE == "S0A00000") {
                window.location.href = "/oleMemberClass/pages/PushManagement/PushManagementPage.jsx?m=" + merchantId;
            } else {
                alert("新增失败：" + ret.RETURN_DESC || "")
            }
        })
    })

    //删除该条推送
    $("body").on("click", "#deletePushManagement", function () {
        var isDo = confirm("确认删除该推送服务？");
        if (isDo) {
            var postData = {};
            postData.id = $(this).data("id");
            $.post("deletePushManagement.jsx?m=" + merchantId, postData, function (ret) {
                if (ret.RETURN_CODE == "S0A00000") {
                    alert(ret.RETURN_DESC);
                    // $("#doEditPushServicedModal").modal("hide");
                    pagination.load(null);
                } else {
                    alert(ret.RETURN_DESC);
                }
            }, 'json');
        }
    })
    //编辑推送管理
    $("body").on("click", "#editPushManagement", function () {
        var postData = {};
        postData.m = merchantId;
        postData.id = $(this).data("id");
        $.post("pushManagementEdit.jsx?m=" + merchantId, postData, function (ret) {
            $("#doEditPushServiceDiv").html(ret);
        }, "html");
        $("#doEditPushServicedModal").modal("show");
    })
    //编辑保存事件
    $("body").on("click", "#doSave", function () {
        var postData = getPostData("pushManagementEditForm");
        if (!postData) {
            alert("代码元素id出错");
            return;
        }
        postData.id = $(this).data("a");
        $.post("editPushManagement.jsx?m=" + merchantId, postData, function (ret) {
            if (ret.RETURN_CODE == "S0A00000") {
                alert(ret.RETURN_DESC);
                $("#doEditPushServicedModal").modal("hide");
                pagination.load(null);
            } else {
                alert(ret.RETURN_DESC);
            }
        }, "json");
    });
    $("#searchForm").on('click', "#search", function () {
        var searchArgs = getPostData("searchForm");
        if (!searchArgs || searchArgs == "" || searchArgs == undefined || searchArgs == null) {
            alert("代码元素id出错");
            return;
        }
        // var orderLabelKeyword = $.trim($("#orderLabelId").val());
        searchArgs.m = merchantId;
        // if (orderLabelKeyword != "") {
        //     searchArgs.orderLabelKeyword = orderLabelKeyword;
        // }
        pagination.load(searchArgs);
    });
});

function getPostData(ElementId) {
    var id = ElementId;
    if ($("#" + id + "").length <= 0) {
        return false;
    }
    var pushTarget_value = $("#" + id + "").find("#pushTarget option:selected").attr("value");
    // $("#pushTarget option:selected").attr("value");
    var toTriggerState_value = $("#" + id + "").find("#toTriggerState option:selected").attr("value");
    // $("#toTriggerState option:selected").attr("value");
    var pushServer_value = $("#" + id + "").find("#pushServer option:selected").attr("value");
    var pushContentSetUp_value = $("#" + id + "").find("#pushContentSetUp option:selected").attr("value");
    var pushStatement_value = $("#" + id + "").find("#pushStatement option:selected").attr("value");
    var pushContent_value = $.trim($("#" + id + "").find("#pushContent").val());//推送内容
    if (id != "searchForm") {
        if (pushTarget_value == "" || !pushTarget_value || pushTarget_value == undefined || pushTarget_value == null) {
            alert("请先选择推送对象");
            return;
        }
        if (toTriggerState_value == "" || !toTriggerState_value || toTriggerState_value == undefined || toTriggerState_value == null) {
            alert("请先选择触发状态");
            return;
        }
        if (pushServer_value == "" || !pushServer_value || pushServer_value == undefined || pushServer_value == null) {
            alert("请先选择推送渠道");
            return;
        }
        if (pushContentSetUp_value == "" || !pushContentSetUp_value || pushContentSetUp_value == undefined || pushContentSetUp_value == null) {
            alert("请先选择推送内容选择");
            return;
        }
        if (pushStatement_value == "" || !pushStatement_value || pushStatement_value == undefined || pushStatement_value == null) {
            alert("请先选择推送状态");
            return;
        }
        if (pushContent_value == "" || !pushContent_value || pushContent_value == undefined || pushContent_value == null) {
            alert("请先填写推送内容");
            return;
        }
    } else {

    }

    var applyData = {
        pushTarget_value: pushTarget_value,
        toTriggerState_value: toTriggerState_value,
        pushServer_value: pushServer_value,
        pushContentSetUp_value: pushContentSetUp_value,
        pushStatement_value: pushStatement_value,
        pushContent_value: pushContent_value
    };
    return applyData;
}

function getSearform() {

}