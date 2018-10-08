//#import excel.js
//#import Util.js
//#import DateUtil.js
//#import login.js
//#import user.js
//#import product.js
//#import $oleMobileApi:services/TrialProductService.jsx
//#import $oleMobileApi:services/trialProductQuery.jsx
//#import $oleTrialReport:services/TrialReportService.jsx

/**
 * 导出试用报告
 */
(function () {
    var merchantId = $.params["m"] || $.getDefaultMerchantId();
    var productId = $.params["productId"] || "";
    var examineStatus = $.params["examineStatus"] || "";
    var activityId = $.params["activityId"] || "";
    var exportName = $.params["exportName"] || (new Date()).getTime() + LoginService.getBackEndLoginUserId();
    var index = 0;
    var titles = [
        {"index": index++, "columnWidth": "22", "field": "userId", "title": "用户id"},
        {"index": index++, "columnWidth": "22", "field": "userName", "title": "用户名"},
        {"index": index++, "columnWidth": "22", "field": "productId", "title": "试用商品id"},
        {"index": index++, "columnWidth": "22", "field": "productName", "title": "试用商品名"},
        {"index": index++, "columnWidth": "22", "field": "activityId", "title": "活动id"},
        {"index": index++, "columnWidth": "22", "field": "activityName", "title": "活动名称"},
        {"index": index++, "columnWidth": "22", "field": "oneSentence", "title": "一句话总结"},
        {"index": index++, "columnWidth": "22", "field": "createTime", "title": "申请时间"},
        {"index": index++, "columnWidth": "22", "field": "examineStatus", "title": "审核状态"},
        {"index": index++, "columnWidth": "22", "field": "examineTime", "title": "操作时间"},
        {"index": index++, "columnWidth": "22", "field": "examineUserId", "title": "操作账户"}
    ];
    try {
        var params = {
            activityId: activityId,
            productId: productId,
            examineStatus: examineStatus
        };
        var trialReportList = TrialReportUtilService.get(params, "like", "", 9999, 0);

        var list = trialReportList.list;

        var exportList = [];
        var tempStatus;
        for (var i = 0, len = list.length; i < len; i++) {
            var exportObj = {};
            exportObj.userId = list[i].userId;
            exportObj.userName = list[i].userInfo.nickName;
            exportObj.productId = list[i].productId;
            exportObj.productName = list[i].productName;
            exportObj.activityId = list[i].activityId;
            exportObj.activityName = list[i].activityName;
            exportObj.oneSentence = list[i].oneSentence || "";
            exportObj.createTime = list[i].createTime;
            if (list[i].examineInfo.examineStatus == "-1"){
                tempStatus = "审核未通过";
            }else if (list[i].examineInfo.examineStatus == "1"){
                tempStatus = "审核通过";
            }else {
                tempStatus = "未审核";
            }
            exportObj.examineStatus = tempStatus;
            exportObj.examineTime = list[i].examineInfo.CreateTime;
            exportObj.examineUserId = list[i].examineInfo.examineUserId;
            exportList.push(exportObj);
        }

        var export_file_type = "Trail_Report_List_Excel";


        var s = Excel.createExcelList(merchantId, exportName, export_file_type, titles, exportList);
    } catch (e) {
        $.log(e);
    }
    if (s == "ok") {
        out.print(JSON.stringify({param: "ok", msg: "导出成功"}));
    }
})();