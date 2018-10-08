//#import Util.js
//#import excel.js
//#import $oleMobileApi:services/BlackListService.jsx
//#import @oleMobileApi:server/util/ResponseUtils.jsx
//#import @oleMobileApi:server/util/Preconditions.jsx
;(function () {
    try {
        var m = $.params["m"];
        if (!m) {
            m = $.getDefaultMerchantId();
        }
        var fileName = $.params.fileName;//导出文件名

        var export_file_type = "BlackList";//excel类型

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

        var index = 0;
        var titles = [
            {"index": index++, "columnWidth": "22", "field": "id", "title": "黑名单序号"},
            {"index": index++, "columnWidth": "22", "field": "userId", "title": "用户id"},
            {"index": index++, "columnWidth": "22", "field": "realName", "title": "用户真名"},
            {"index": index++, "columnWidth": "22", "field": "nickName", "title": "用户昵称"},
            {"index": index++, "columnWidth": "22", "field": "mobilPhone", "title": "用户手机号"},
            {"index": index++, "columnWidth": "22", "field": "source", "title": "用户来源"},
            {"index": index++, "columnWidth": "22", "field": "managerId", "title": "管理员id"},
            {"index": index++, "columnWidth": "22", "field": "productId", "title": "商品id"},
            {"index": index++, "columnWidth": "22", "field": "activityId", "title": "活动id"},
            {"index": index++, "columnWidth": "22", "field": "orderId", "title": "订单id"},
            {"index": index++, "columnWidth": "22", "field": "reasonCode", "title": "原因码"},
            {"index": index++, "columnWidth": "22", "field": "inReason", "title": "加入原因"},
            {"index": index++, "columnWidth": "22", "field": "outReason", "title": "移除原因"},
            {"index": index++, "columnWidth": "22", "field": "createTime", "title": "创建时间"}
        ];

        var list = BlackListService.get(params, 1000, 0).list;

        var exportList = [];

        for (var i = 0, len = list.length; i < len; i++) {
            var exportObj = {};
            exportObj.id = list[i].id;
            exportObj.userId = list[i].userInfo.userId;
            exportObj.realName = list[i].userInfo.realName;
            exportObj.nickName = list[i].userInfo.nickName;
            exportObj.mobilPhone = list[i].userInfo.mobilPhone;
            exportObj.source = list[i].userInfo.source;
            exportObj.managerId = list[i].managerId;
            exportObj.productId = list[i].productId;
            exportObj.activityId = list[i].activityId;
            exportObj.orderId = list[i].orderId;
            exportObj.reasonCode = list[i].reasonCode;
            exportObj.inReason = list[i].inReason;
            exportObj.outReason = list[i].outReason;
            exportObj.createTime = list[i].createTime;

            exportList.push(exportObj);
        }

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