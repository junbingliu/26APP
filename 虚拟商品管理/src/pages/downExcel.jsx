//#import Util.js
//#import excel.js
//#import file.js
(function () {
    var result = {};
    try {
        var merchantId = $.params["m"] || "head_merchant";
        var fileType = $.params["fileType"];

        var index = 0, titles = [], resultList = [];
        if(fileType == "add"){
            var fileName = "批量添加虚拟商品模板";
            var export_file_type_infomation = "export_file_type_oleVirtualProductAdd";
            var histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
            if (histories.length == 0) {
                titles = [
                    {"index": index++, "columnWidth": "22", "title": "商品名称"},
                    {"index": index++, "columnWidth": "22", "title": "卡批次"},
                    {"index": index++, "columnWidth": "40", "title": "渠道(微商城/APP/微商城,APP)"},
                    {"index": index++, "columnWidth": "22", "title": "市场价"},
                    {"index": index++, "columnWidth": "22", "title": "现价/会员价"}
                ];

                var k = Excel.createExcelList(merchantId, fileName, export_file_type_infomation, titles, resultList);
                if (k == "ok") {
                    histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
                }
            }
        } else {
            var fileName = "批量修改虚拟商品模板";
            var export_file_type_infomation = "export_file_type_oleVirtualProductUpdate";
            var histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
            if (histories.length == 0) {
                titles = [
                    {"index": index++, "columnWidth": "22", "title": "商品编码/条形码"},
                    {"index": index++, "columnWidth": "40", "title": "渠道(微商城/APP/微商城,APP)"},
                    {"index": index++, "columnWidth": "22", "title": "市场价"},
                    {"index": index++, "columnWidth": "22", "title": "现价/会员价"},
                    {"index": index++, "columnWidth": "22", "title": "库存/可卖数"}
                ];

                var k = Excel.createExcelList(merchantId, fileName, export_file_type_infomation, titles, resultList);
                if (k == "ok") {
                    histories = Excel.getExcelList4History(merchantId, export_file_type_infomation, "1");
                }
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