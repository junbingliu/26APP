//#import Util.js
//#import excel.js
//#import login.js
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
//#import $oleMobileApi:services/TrialProductService.jsx

/**
 * 导出黑名单
 */

;(function () {
    try {
        var m = $.params["m"];
        if (!m) {
            m = $.getDefaultMerchantId();
        }
        var fileName = $.params.fileName || (new Date()).getTime() + LoginService.getBackEndLoginUserId();//导出文件名

        var export_file_type = "application_black_list";//excel类型

        var id = $.params.id || "";//黑名单序号

        var userId = $.params.userId || "";//用户id

        var managerId = $.params.managerId || ""; //管理员id

        var productId = $.params.productId || ""; //商品id

        var activityId = $.params.activityId || ""; //活动id

        var orderId = $.params.orderId || "";//订单id

        var reasonCode = $.params.reasonCode || ""; //原因码

        var inReason = $.params.inReason || ""; //加入原因

        var outReason = $.params.outReason || ""; //移除原因

        var beginTime = $.params.beginTime || ""; //开始时间

        var endTime = $.params.endTime || ""; //结束时间

        var params = {
            id: id,
            userId: userId,
            managerId: managerId,
            productId: productId,
            activityId: activityId,
            orderId: orderId,
            reasonCode: reasonCode,
            inReason: inReason,
            outReason: outReason,
            beginTime: beginTime,
            endTime: endTime
        };
        if(activityId == "-1"){
            params.activityId = "";
        }
        var index = 0;
        var titles = [
            {"index": index++, "columnWidth": "22", "field": "nickName", "title": "用户昵称"},
            {"index": index++, "columnWidth": "22", "field": "productName", "title": "商品名"},
            {"index": index++, "columnWidth": "22", "field": "contactPerson", "title": "联系人"},
            {"index": index++, "columnWidth": "22", "field": "mobilPhone", "title": "联系电话"},
            {"index": index++, "columnWidth": "22", "field": "address", "title": "收货地址"},
            {"index": index++, "columnWidth": "22", "field": "applicationTime", "title": "申请时间"},
            {"index": index++, "columnWidth": "22", "field": "stateName", "title": "申请结果"},
            {"index": index++, "columnWidth": "22", "field": "activityId", "title": "活动iD"},
            {"index": index++, "columnWidth": "22", "field": "userId", "title": "用户ID"},
            {"index": index++, "columnWidth": "22", "field": "productId", "title": "商品iD"},
            {"index": index++, "columnWidth": "22", "field": "inReason", "title": "备注"}
        ];

        var list = BlackListService.get(params, 1000, 0).list;

        var exportList = [];

        for (var i = 0, len = list.length; i < len; i++) {
            var exportObj = {};
            var activeId = list[i].activityId;
            var applicationId = TrialProductService.getObjectId(list[i].userInfo.userId,activeId,list[i].productId);
            var applicationObj =TrialProductService.getObject(applicationId);
            exportObj.userId = list[i].userInfo.userId;
            exportObj.nickName = list[i].userInfo.nickName;
            exportObj.contactPerson = applicationObj.addressInfo.userName;
            exportObj.mobilPhone = applicationObj.addressInfo.phone;
            exportObj.address = applicationObj.addressInfo.address;
            exportObj.productId = list[i].productId;
            exportObj.activityId = list[i].activityId;
            exportObj.inReason = list[i].inReason;
            exportList.push(exportObj);
        }
        //导出内容放到数组里
        var s = Excel.createExcelList(m, fileName, export_file_type, titles, exportList);
    } catch (e) {
        $.log(e);
    }
    var result ={};
    if (s == "ok") {
        result.state = "ok";
        result.msg = "导出成功！";
    } else {
        result.state = "error";
        result.msg = "导出失败！";
    }
    out.print(JSON.stringify(result));

})();