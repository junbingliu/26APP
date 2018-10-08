//#import Util.js
//#import excel.js
//#import file.js
(function () {
    var result = {};
    try {
        var merchantId = $.params["m"] || $.getDefaultMerchantId();
        var fileName = "上传修改咨询模板";
        var export_file_type_infomation = "export_file_type_infomation1";
        var index = 0, titles = [], resultList = [], histories, ok = "";
        histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
        if (histories.length == 0) {
            titles = [
                {"index": index++, "columnWidth": "22", "title": "编码"},
                {"index": index++, "columnWidth": "30", "title": "渠道(App或者微商城或者所有)"},
                {"index": index++, "columnWidth": "30", "title": "上下架状态(上架或者下架)"}
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