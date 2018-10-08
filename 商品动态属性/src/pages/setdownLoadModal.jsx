//#import Util.js
//#import excel.js
//#import file.js
(function () {
    try{
        var merchantId = $.params["m"]|| $.getDefaultMerchantId();
        var fileName= $.params.fileName||"修改商品属性模板";
        var fileName2= $.params.fileName2||"查看商品属性模板";
        var export_file_type="outPutProductModal";
        var index = 0;
        var titles=[
            {"index": index++, "columnWidth": "22", "title":"商家ID(商品的商家ID,必填,列名不能修改,否则无法导出正常数据))"},
            {"index": index++, "columnWidth": "30", "title":"商品erp编码(erp编码,必填,列名不能修改,否则无法导出正常数据)"},
            {"index": index++, "columnWidth": "60", "title":"属性名和该属性名修改值用冒号隔开（属性名:属性值）"},
            {"index": index++, "columnWidth": "60", "title":"属性名2和该属性名修改值用冒号隔开（属性名2:属性值）"},
            {"index": index++, "columnWidth": "60", "title":"...（更多属性名和该属性名修改值）"}
        ];
        index = 0;
        var titles2=[
            {"index": index++, "columnWidth": "22", "title":"商家ID(商品的商家ID,必填)"},
            {"index": index++, "columnWidth": "30", "title":"商品erp编码(erp编码，必填)"},
            {"index": index++, "columnWidth": "60", "title":"属性名（属性名）"},
            {"index": index++, "columnWidth": "60", "title":"属性名2（属性名2）"},
            {"index": index++, "columnWidth": "60", "title":"...（更多属性名）"}
        ]
        var resultList=[
        ];
        var s = Excel.createExcelList(merchantId, fileName, export_file_type, titles, resultList);
        var k = Excel.createExcelList(merchantId, fileName2, export_file_type, titles2, resultList);
        var result = {};
        if (s == "ok"&&k=="ok") {
            result.state = "ok";
            result.msg = "设置成功！";
        } else {
            result.state = "error";
            result.msg = "设置失败！";
        }
        out.print(JSON.stringify(result));
    }
    catch(e){
        var result = {};
        result.state = "error";
        result.msg = "异常！";
        out.print(JSON.stringify(result));
    }

})();