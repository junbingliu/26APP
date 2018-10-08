//#import Util.js
//#import excel.js
//#import file.js
(function () {
    var result = {};
    try {
        var merchantId = $.params["m"] || $.getDefaultMerchantId();
        var fileName = "积分商品模板";
        var export_file_type_infomation = "integral_product_manager_import";
        var index = 0, titles = [], resultList = [], histories, ok = "";
        histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
        if (histories.length == 0) {
            titles = [
                {"index": index++, "columnWidth": "30", "title": "商家ID/商家名称(必填)"},
                {"index": index++, "columnWidth": "20", "title": "SKU编码(必填)"},
                {"index": index++, "columnWidth": "30", "title": "商品分类(必填)"},
                {"index": index++, "columnWidth": "20", "title": "现金(必填)"},
                {"index": index++, "columnWidth": "20", "title": "积分值(必填)"}
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