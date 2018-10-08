$(document).ready(function () {
    var initconfig = {
        bsV: "3",
        ajaxUrl: "LoadSystemRecords.jsx",
        data_container: ".record_list",
        pagination_container: ".pagination",
        pagination_params: ".pagination_params"
    };
    var merchantId = $("#merchantId").val();
    var pagination = new $.IsoneAjaxPagination(initconfig);
    pagination.load({m: merchantId});
    // $("#searchForm").on('click', "#search", function () {
    //     var searchArgs = getPostData("searchForm");
    //     if (!searchArgs || searchArgs == "" || searchArgs == undefined || searchArgs == null) {
    //         alert("代码元素id出错");
    //         return;
    //     }
    //     searchArgs.m = merchantId;
    //     pagination.load(searchArgs);
    // });
});
//
// function getPostData(ElementId) {
//     var id = ElementId;
//     if ($("#" + id + "").length <= 0) {
//         return false;
//     }
//     var pushTarget_value = $("#" + id + "").find("#pushTarget option:selected").attr("value");
//     // $("#pushTarget option:selected").attr("value");
//     var toTriggerState_value = $("#" + id + "").find("#toTriggerState option:selected").attr("value");
//     // $("#toTriggerState option:selected").attr("value");
//     var pushServer_value = $("#" + id + "").find("#pushServer option:selected").attr("value");
//     var pushContentSetUp_value = $("#" + id + "").find("#pushContentSetUp option:selected").attr("value");
//     var pushStatement_value = $("#" + id + "").find("#pushStatement option:selected").attr("value");
//     var pushContent_value = $.trim($("#" + id + "").find("#pushContent").val());//推送内容
//     if (id != "searchForm") {
//         if (pushTarget_value == "" || !pushTarget_value || pushTarget_value == undefined || pushTarget_value == null) {
//             alert("请先选择推送对象");
//             return;
//         }
//         if (toTriggerState_value == "" || !toTriggerState_value || toTriggerState_value == undefined || toTriggerState_value == null) {
//             alert("请先选择触发状态");
//             return;
//         }
//         if (pushServer_value == "" || !pushServer_value || pushServer_value == undefined || pushServer_value == null) {
//             alert("请先选择推送渠道");
//             return;
//         }
//         if (pushContentSetUp_value == "" || !pushContentSetUp_value || pushContentSetUp_value == undefined || pushContentSetUp_value == null) {
//             alert("请先选择推送内容选择");
//             return;
//         }
//         if (pushStatement_value == "" || !pushStatement_value || pushStatement_value == undefined || pushStatement_value == null) {
//             alert("请先选择推送状态");
//             return;
//         }
//         if (pushContent_value == "" || !pushContent_value || pushContent_value == undefined || pushContent_value == null) {
//             alert("请先填写推送内容");
//             return;
//         }
//     } else {
//
//     }
//
//     var applyData = {
//         pushTarget_value: pushTarget_value,
//         toTriggerState_value: toTriggerState_value,
//         pushServer_value: pushServer_value,
//         pushContentSetUp_value: pushContentSetUp_value,
//         pushStatement_value: pushStatement_value,
//         pushContent_value: pushContent_value
//     };
//     return applyData;
// }
//
// function getSearform() {
//
// }