//#import Util.js
//#import excel.js
//#import file.js
(function () {
    try {
        var merchantId = $.params["m"] || $.getDefaultMerchantId();
        var fileName = $.params.fileName || "批量调整商品属性模板";
        var export_file_type = "outPutChannelProductModal";
        var index = 0;
        var titles = [
            {"index": index++, "columnWidth": "24", "title": "商家ID(商品的商家ID,必填)"},
            {"index": index++, "columnWidth": "18", "title": "SKU或条形码(必填)"},
            {"index": index++, "columnWidth": "30", "title": "渠道(渠道,必填,可填：微商城或APP或微商城,APP)"},
            {"index": index++, "columnWidth": "20", "title": "可卖数(可卖数,必填)"},
            {"index": index++, "columnWidth": "30", "title": "上下架状态(上下架状态,必填,可填：上架或下架)"}
        ];

        var resultList = [];
        var s = Excel.createExcelList(merchantId, fileName, export_file_type, titles, resultList);
        var result = {};
        if (s == "ok") {
            var histories = Excel.getExcelList4History(merchantId, export_file_type, "1");
            result.state = "ok";
            result.msg = "设置成功！";
            result.url = histories && histories[0].url + "&fileName=" + histories[0].fileName;
        } else {
            result.state = "error";
            result.msg = "设置失败！";
        }
        out.print(JSON.stringify(result));
    } catch (e) {
        var result = {};
        result.state = "error";
        result.msg = "异常！";
        out.print(JSON.stringify(result));
    }

})();