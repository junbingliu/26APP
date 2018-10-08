//#import Util.js
//#import excel.js
//#import file.js
(function () {
    var result = {};
    try {
        var merchantId = $.params["m"] || "head_merchant";
        var fileName = "上传批量合并OLE用户模板";
        var export_file_type_infomation = "export_file_type_oleUserBatchMerge";
        var index = 0, titles = [], resultList = [];
        var histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
        if (histories.length == 0) {
            titles = [
                {"index": index++, "columnWidth": "22", "title": "账号"},
                {"index": index++, "columnWidth": "22", "title": "目标账号"},
                {"index": index++, "columnWidth": "40", "title": "操作类型(合并所有资料/只合并动态数据)"}
            ];
            var k = Excel.createExcelList(merchantId, fileName, export_file_type_infomation, titles, resultList);
            if (k == "ok") {
                histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
            }
        }
        if (histories.length > 0) {
            result.state = "ok";
            result.url = histories[0].url + "&fileName=" + histories[0].fileName;
        } else {
            result.state = "error";
            result.msg = "创建失败！";
        }
        out.print(JSON.stringify(result));
    }
    catch (e) {
        result.state = "error";
        result.msg = "异常！";
        out.print(JSON.stringify(result));
    }

})();